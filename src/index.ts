import discord, {
  MessageEmbed,
  TextChannel,
  DMChannel,
  NewsChannel,
  GuildMemberManager,
} from "discord.js";
import dotenv from "dotenv";
dotenv.config();
import { SettingsStore } from "./settingsStore";
import { UserStore } from "./userStore";
import { ChallengeStore } from "./challengeStore";
import {
  roleHandler,
  mentionHandler,
  emojiHandler,
  commandParser,
  givenMoney,
} from "./util";

const client = new discord.Client();
const settingsStore = new SettingsStore(); //TODO make me env var (dont be lazy scoot scoot)

const userStore = new UserStore();
const challengeStore = new ChallengeStore();

import logger from "./logger";
const changeSuccessful = (
  channel: TextChannel | DMChannel | NewsChannel,
  fieldName: string,
  givenValue: string,
  originalValue: string
): void => {
  const embed = new MessageEmbed()
    .setTitle("Update Successful!")
    .setColor("#20fc03")
    .setDescription(`*${fieldName}:* \n ${originalValue} => ${givenValue}`);
  channel.send(embed);
};
client.on("message", (msg) => {
  const delim = settingsStore.settings.delim;
  const { content } = msg;
  const settingsCopy = { ...settingsStore.settings };
  try {
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

      if (content.startsWith(`${delim}triggerSave`)) {
        userStore.saveToFireStore();
        const embed = new MessageEmbed().setTitle("Saved");
        msg.channel.send(embed);
        return;
      }

      if (content.startsWith(`${delim}addPhoto`)) {
        const [_, photoString] = commandParser(content);
        const space = photoString.indexOf(" ");
        let photoUrl;
        let name;
        if (space == -1) {
          photoUrl = photoString;
        } else {
          photoUrl = photoString.substr(0, space);
          name = photoString.substr(space + 1);
        }
        userStore.addPhoto(photoUrl, name);
        msg.channel.send(
          new MessageEmbed().setTitle("Photo Added").setImage(photoUrl)
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
    if (content.startsWith(`${delim}getSettings`)) {
      const clonedSettings = { ...settingsStore.settings };
      clonedSettings.role = `<@&${clonedSettings.role}>`;
      clonedSettings.emoji = `<:${clonedSettings.emoji}:>`;
      const embed = new MessageEmbed()
        .setTitle("Current QuickCurrency Settings:")
        .setColor("#e5ff00")
        .setDescription(JSON.stringify(clonedSettings, null, 2));
      msg.channel.send(embed);
      return;
    }
    if (
      content.startsWith(`${delim}leaderboard`) ||
      content.startsWith(`${delim}lb`)
    ) {
      const topTen = userStore.getTop(10);
      const embed = new MessageEmbed()
        .setTitle("The richest people in the guild!")
        .setColor("#fc8c03")
        .setDescription(
          topTen.reduce(
            (curr, record) => curr + `\n <@${record[0]}> | ${record[1]}`,
            ""
          )
        );
      msg.channel.send(embed);
      return;
    }
    if (
      content.startsWith(`${delim}mybalance`) ||
      content.startsWith(`${delim}b`)
    ) {
      if (msg.member) {
        const embed = new MessageEmbed()
          .setTitle(
            `${msg.member.nickname || msg.member.displayName}'s Balance!`
          )
          .setDescription(
            `You currently have: \n${userStore.getMyBalance(msg.member.id)}\n ${
              settingsStore.settings.currencyName
            }`
          );
        msg.channel.send(embed);
        return;
      }
    }

    if (
      content.startsWith(`${delim}makeItRain`) ||
      (content.startsWith(`${delim}MIR`) &&
        msg.member?.roles.cache.find(
          (role) => role.id === settingsStore.settings.role
        ))
    ) {
      const [_, amount] = commandParser(content);
      const embed = new MessageEmbed()
        .setTitle("Made it rain!")
        .setDescription(`<@${msg.member?.id}> made it rain with: ${amount}`)
        .setImage("https://media.giphy.com/media/4jh01W2g1qrbG/giphy.gif");
      const numAmount = parseInt(amount);
      if (isNaN(numAmount)) {
        throw new Error(`Cannot make it rain with ${amount}`);
      }
      if (msg.guild && msg.member) {
        userStore.makeItRain(
          numAmount,
          msg.guild.members.cache.map((m) => m.id),
          msg.member.displayName
        );
      }

      msg.channel.send(embed);
      return;
    }
    if (
      content.startsWith(`${delim}gma`) ||
      content.startsWith(`${delim}giveMoneyAdmin`)
    ) {
      const [_, args] = commandParser(content);
      const arrayArgs = args.split(" ");
      const person = mentionHandler(arrayArgs[0])[0];

      const amount = arrayArgs[1];
      const numAmount = parseInt(amount);
      if (isNaN(numAmount)) {
        throw new Error("Invalid number");
      }
      logger.info(person, msg.content);
      const hasRole = msg.member?.roles.cache.find(
        (r) => r.id === settingsStore.settings.role
      );

      if (person && hasRole && msg.member) {
        userStore.addBucks(person, numAmount, msg.member.id, person);
        msg.channel.send(
          givenMoney(
            numAmount,
            msg.member.id,
            person,
            settingsStore.settings.currencyName
          )
        );
      }
      return;
    }
    if (
      content.startsWith(`${delim}giveMoney`) ||
      content.startsWith(`${delim}gm`)
    ) {
      const [_, args] = commandParser(content);
      const arrayArgs = args.split(" ");
      const person = mentionHandler(arrayArgs[0])[0];

      const amount = arrayArgs[1];
      const numAmount = parseInt(amount);
      if (isNaN(numAmount)) {
        throw new Error("Invalid number");
      }
      logger.info(person, msg.content);
      const hasRole = msg.member?.roles.cache.find(
        (r) => r.id === settingsStore.settings.role
      );
      if (person) {
        if (numAmount > 0) {
          if (msg.member) {
            if (!(userStore.getMyBalance(msg.member.id) >= numAmount)) {
              throw new Error("Insufficient Funds");
            }
            userStore.addBucks(
              person,
              numAmount,
              msg.member.displayName,
              person
            );
            userStore.billAccount(
              msg.member.id,
              numAmount,
              person,
              msg.member.displayName
            );
            msg.channel.send(
              givenMoney(
                numAmount,
                msg.member.id,
                person,
                settingsStore.settings.currencyName
              )
            );
          }
        }
      }
      return;
    }

    if (content.startsWith(`${delim}randomPhoto`)) {
      ///pick random photo from db and reduce funds.#
      if (
        msg.member &&
        userStore.getMyBalance(msg.member.id) > settingsStore.settings.photoBill
      ) {
        userStore.getPhoto().then((p) => {
          const embed = new MessageEmbed()
            .setTitle(p.text || "Look at this photograph!")
            .setImage(p.location);
          if (msg.member) {
            userStore.billAccount(
              msg.member.id,
              settingsStore.settings.photoBill,
              "Random Photo",
              msg.member.displayName
            );
            msg.channel.send(embed);
          }
        });
      } else {
        msg.channel.send(
          new MessageEmbed().setTitle("Insuffient Funds").setColor("#FF0000")
        );
      }
      return;
    }

    if (
      content.startsWith(`${delim}showChallenges`) ||
      content.startsWith(`${delim}sc`)
    ) {
      const [_, name] = commandParser(content);
      if (name != `${delim}sc`) {
        challengeStore
          .specificChallengeStatus(name)
          .then((challenge) => msg.channel.send(challenge))
          .catch((e) =>
            msg.channel.send(
              new MessageEmbed()
                .setTitle("ERROR!")
                .setColor("#ad0000")
                .setDescription(`Your last command failed: ${e.message}`)
            )
          );
      } else {
        challengeStore.listChallenges(msg.channel);
      }
      return;
    }

    if (
      content.startsWith(`${delim}donateToChallenge`) ||
      content.startsWith(`${delim}dc`)
    ) {
      // =dc <DONATE AMOUNT> <CHALLENGE NAME>
      const [_, amount_name_str] = commandParser(content);

      const split = amount_name_str.split(" ");
      if (split.length >= 2 && msg.member) {
        const amount = split[split.length - 1];
        const name = split.slice(0, split.length - 1).join(" ");
        const numAmount = parseInt(amount);
        if (isNaN(numAmount)) throw new Error("Invalid Number");
        if (numAmount > 0) {
          if (userStore.getMyBalance(msg.member.id) >= numAmount) {
            challengeStore
              .addToChallenge(numAmount, name)
              .then(() => {
                if (msg.member) {
                  userStore.billAccount(
                    msg.member.id,
                    numAmount,
                    msg.member.displayName,
                    name
                  );
                  //TODO EMBED!
                  msg.channel.send(
                    new MessageEmbed()
                      .setTitle(`Donation to the ${name} challenge fund!`)
                      .setDescription(
                        `<@${msg.member.id}> just donated ${amount} ${settingsStore.settings.currencyName} to the ${name} challenge fund!`
                      )
                      .setImage(
                        "https://media.giphy.com/media/xTiTnqUxyWbsAXq7Ju/giphy.gif"
                      )
                  );
                  logger.info(
                    `${msg.member.displayName} donated ${amount} to: ${name} Challenge!`
                  );
                }
              })
              .catch((e) => {
                const errorEmbed = new MessageEmbed()
                  .setTitle("ERROR!")
                  .setColor("#ad0000")
                  .setDescription(`Your last command failed: ${e.message}`);
                msg.channel.send(errorEmbed);
              });
          } else {
            throw new Error("Insufficient funds");
          }
        }
      } else {
        throw new Error(
          "Invalid format, use =dc <CHALLENGE NAME> <DONATE AMOUNT> "
        );
      }
      return;
    }

    if (content.startsWith(`${delim}`)) {
      throw new Error("Unknown Command");
    }
  } catch (e) {
    const errorEmbed = new MessageEmbed()
      .setTitle("ERROR!")
      .setColor("#ad0000")
      .setDescription(`Your last command failed: ${e.message}`);
    msg.channel.send(errorEmbed);
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

import express from "express";

const app = express();
app.get("/", (req: any, res: any) => res.send("You have found the secret"));
app.listen(process.env.PORT, () => logger.info("Working"));
