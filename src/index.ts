import discord, { MessageEmbed } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

import { SettingsStore } from "./settingsStore";
import { UserStore } from "./userStore";
import { ChallengeStore } from "./challengeStore";
import logger from "./logger";

import {
  roleHandler,
  emojiHandler,
  commandParser,
  givenMoney,
  errorEvent,
  changeSuccessful,
} from "./util";

import { commandsByAlias } from "./commands";
import express from "express";

const client = new discord.Client();
const settingsStore = new SettingsStore();

const userStore = new UserStore();
const challengeStore = new ChallengeStore();

logger.info(commandsByAlias);

client.on("message", async (msg) => {
  const delim = settingsStore.settings.delim;
  const { content } = msg;
  const settingsCopy = { ...settingsStore.settings };
  try {
    if (content.startsWith(delim)) {
      if (msg.member?.permissions.has("ADMINISTRATOR")) {
        // User is admin (should probably be configurable)
        if (content.startsWith(`${delim}setRole`)) {
          //roles should really be array.
          //user set role. check that they have required perms!
          const roles = roleHandler(content);
          settingsStore.setRole(roles[0]); //unsafe, start using yup.
          logger.info(settingsStore.settings.role);

          changeSuccessful(msg.channel, "Role", roles[0], settingsCopy.role);
          return;
        }

        if (content.startsWith(`${delim}setDelim`)) {
          const [_, newDelim] = commandParser(content);
          settingsStore.setDelim(newDelim);
          changeSuccessful(msg.channel, "Delim", newDelim, settingsCopy.delim);
          return;
        }

        if (content.startsWith(`${delim}setEmote`)) {
          const [_, emote] = commandParser(content);
          settingsStore.setEmoji(emojiHandler(emote));
          logger.info(settingsStore.settings.emoji);
          changeSuccessful(msg.channel, "Emote", emote, settingsCopy.emoji);
          return;
        }
        if (content.startsWith(`${delim}setCurrencyValue`)) {
          const [_, val] = commandParser(content);
          const numVal = parseInt(val);
          if (isNaN(numVal)) {
            throw new Error(`Cannot set currency to ${val}`);
          }
          settingsStore.setCurrencyValue(numVal);
          changeSuccessful(
            msg.channel,
            "Currency Value",
            val,
            settingsCopy.currencyValue.toString()
          );
          return;
        }
        if (content.startsWith(`${delim}setCurrencyName`)) {
          const [_, name] = commandParser(content);
          settingsStore.setCurrencyName(name);
          changeSuccessful(
            msg.channel,
            "Currency Name",
            name,
            settingsCopy.currencyName
          );
          return;
        }
        if (content.startsWith(`${delim}setPhotoPrice`)) {
          const [_, price] = commandParser(content);
          const numPrice = parseInt(price);

          if (isNaN(numPrice)) {
            throw new Error(`Price ${price} is not accpetable`);
          }

          settingsStore.setPhotoPrice(numPrice);
          changeSuccessful(
            msg.channel,
            "Photo Price",
            numPrice.toString(),
            settingsCopy.photoBill.toString()
          );
          return;
        }
      }

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
    msg.channel.send(errorEvent(e));
  }
});

client.on("messageReactionAdd", (reaction, user) => {
  logger.debug(reaction.emoji);
  const member = reaction.message.guild?.members.cache.find(
    (m) => m.id === user.id
  );
  const role = member?.roles.cache.find(
    (r) => r.id === settingsStore.settings.role
  );

  logger.debug(reaction.emoji.id ? reaction.emoji.id : "wtf");
  logger.debug((reaction.emoji.id === settingsStore.settings.emoji).toString());
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
});
client.login(process.env.DISCORD_TOKEN);

const app = express();
app.get("/", (req: any, res: any) => res.send("You have found the secret"));
app.listen(process.env.PORT, () => logger.info("Working"));
