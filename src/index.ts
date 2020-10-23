import discord, { Message, GuildMember } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

import { SettingsStore } from "./stores/settingsStore";
import { UserStore } from "./stores/userStore";
import { ChallengeStore } from "./stores/challengeStore";
import logger from "./logger";

import { commandParser, givenMoney, errorEvent, userFined } from "./util";

import { commandsByAlias, prohibitedCommands, policeOfficer } from "./commands";
import express from "express";
import { db } from "./dbConnection";
import { Member } from "./models/member";

process.on("unhandledRejection", (reason) => {
  if (reason) {
    logger.error(reason);
  } else {
    logger.error("something really went wrong and idk what");
  }
  process.exit(1);
});

process.on("uncaughtException", (e) => {
  logger.error(e); //send to logging first
  process.exit(1);
});


async function Main() {
  const c = await db;

  const client = new discord.Client();
  const settingsStore = new SettingsStore();


  const userStore = new UserStore();
  const challengeStore = new ChallengeStore();
  const checkIgnore = function(member: GuildMember | null, ss: SettingsStore) {
    return (member?.roles.cache.find((r) => r.id === ss.settings.role));
  }

  client.on("message", async (msg) => {
    const delim = settingsStore.settings.delim;
    const { content } = msg;
    
    try {
      if (!checkIgnore(msg.member, settingsStore) && settingsStore.settings.curses.indexOf('') == -1 && settingsStore.settings.curses.length > 0) {
        // todo: get a promise and fullfill by sending userFined =\\
        await policeOfficer.checkMessage(msg.member, content, msg.channel, settingsStore, userStore);
      }
      

      if (content.startsWith(delim)) {
        const [fullCommand, body] = commandParser(content);
        // check if the command is in the prohibited routes (=\, =/, etc.)
        const cmd = fullCommand.substr(1);
         if (prohibitedCommands.includes(fullCommand)) {
          // if so, ignore
          return;
        }

       
        if (commandsByAlias[cmd]) {
          const command = commandsByAlias[cmd];

          if (
            command.requiresRole &&
            !checkIgnore(msg.member, settingsStore)
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

          if (
            command.useIgnoreRole && checkIgnore(msg.member, settingsStore)
          ) {
            logger.info("ignoring");
            return; //The bot ignores you
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

  client.on("guildMemberAdd", async (member) => {
    logger.info(
      await Member.updateOne(
        { _id: member.id },
        { _id: member.id, currency: 1000 },
        { upsert: true }
      )
    );
  });

  client.on("guildMemberRemove", async (member) => {
    logger.info(await Member.deleteOne({ _id: member.id }));
  });

  client.on("messageReactionAdd", async (reaction, user) => {
    try {
      logger.info(settingsStore.settings.ignoreRole);
      if (
        checkIgnore(reaction.message.member, settingsStore)
      ) {
        logger.info("Ignoring");
        return;
      }
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
      guilds.map(async ({ guildId, backgroundAmount, ignoreRole }) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) {
          const users = guild.members.cache
            .filter(
              (member) =>
                member.presence.status === "online" &&
                !checkIgnore(member, settingsStore)
            )
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
  if (process.env.BACKGROUND_TASK_INTERVAL) {
    const bgTaskTime = parseInt(process.env.BACKGROUND_TASK_INTERVAL);
    if (isNaN(bgTaskTime)) {
      throw new Error(
        `${process.env.BACKGROUND_TASK_INTERVAL} is not a valid number you dumbo`
      );
    }
    setInterval(bgTask, bgTaskTime); //Give Money every 5 seconds
  } else {
    throw new Error("BACKGROUND_TASK_INTERVAL not set");
  }
}

Main();
