import discord from "discord.js";
import dotenv from "dotenv";
dotenv.config();

import { SettingsStore } from "./stores/settingsStore";
import { UserStore } from "./stores/userStore";
import { ChallengeStore } from "./stores/challengeStore";
import logger from "./logger";

import { commandParser, givenMoney, errorEvent } from "./util";

import { commandsByAlias } from "./commands";
import express from "express";
import { db } from "./dbConnection";
import { Member } from "./models/member";

async function Main() {
  const c = await db;

  const client = new discord.Client();
  const settingsStore = new SettingsStore();

  const userStore = new UserStore();
  const challengeStore = new ChallengeStore();

  client.on("message", async (msg) => {
    const delim = settingsStore.settings.delim;
    const { content } = msg;
    try {
      if (content.startsWith(delim)) {
        const [fullCommand, body] = commandParser(content);
        const cmd = fullCommand.substr(1);

        if (commandsByAlias[cmd]) {
          const command = commandsByAlias[cmd];

          if (
            command.requiresRole &&
            !msg.member?.roles.cache.find(
              (r) => r.id === settingsStore.settings.role
            )
          ) {
            throw new Error("Unauthorized");
          }

          if (
            command.permissions &&
            command.permissions.length > 0 &&
            !command.permissions.every((p) => msg.member?.permissions.has(p))
          ) {
            throw new Error("Invalid Permissions");
          }
          await command.func(
            body,
            { userStore, challengeStore, settingsStore },
            msg
          );
        } else {
          throw new Error("Unknown command");
        }
      }
    } catch (e) {
      try {
        await msg.channel.send(errorEvent(e));
      } catch (badError) {
        logger.error(
          `A super bad error occured when trying to log: ${e.message} this error is: ${badError.message}`
        );
      }
    }
  });

  client.on("messageReactionAdd", (reaction, user) => {
    try {
      logger.debug(reaction.emoji);
      const member = reaction.message.guild?.members.cache.find(
        (m) => m.id === user.id
      );
      const role = member?.roles.cache.find(
        (r) => r.id === settingsStore.settings.role
      );

      logger.debug(reaction.emoji.id ? reaction.emoji.id : "wtf");
      logger.debug(
        (reaction.emoji.id === settingsStore.settings.emoji).toString()
      );
      if (role) {
        logger.debug(role);
      } else {
        logger.debug("no role");
      }
      if (
        (reaction.emoji.id === settingsStore.settings.emoji ||
          reaction.emoji.name === settingsStore.settings.emoji) &&
        role
      ) {
        if (reaction.message.member && member) {
          userStore.addBucks(
            reaction.message.member.id,
            settingsStore.settings.currencyValue,
            member.displayName,
            reaction.message.member.displayName
          );
          reaction.message.channel.send(
            givenMoney(
              settingsStore.settings.currencyValue,
              member.id,
              reaction.message.member.id,
              settingsStore.settings.currencyName
            )
          );
        }
      }
    } catch (e) {
      logger.error(e);
    }
  });
  client.login(process.env.DISCORD_TOKEN);

  const app = express();
  app.get("/", (req: any, res: any) => res.send("You have found the secret"));
  app.listen(process.env.PORT, () => logger.info("Working"));

  const bgTask = async () => {
    const guilds = await settingsStore.getAllSettings();
    await Promise.all(
      guilds.map(async ({ guildId, backgroundAmount }) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) {
          const users = guild.members.cache
            .filter((member) => member.presence.status === "online")
            .map((u) => u.id);
          await Member.updateMany(
            { _id: { $in: users } },
            { $inc: { currency: backgroundAmount } }
          );

          logger.info("Background Task Ran");
        } else {
          logger.error(`Unknown guild: ${guildId}`);
        }
      })
    );
  };
  setInterval(bgTask, 5000); //Give Money every 5 seconds
}

Main();
