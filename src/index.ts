import discord, {
  MessageEmbed,
  TextChannel,
  
  DMChannel,
  NewsChannel,
} from "discord.js";
import dotenv from "dotenv";
dotenv.config();
import { SettingsStore } from "./settingsStore";
import { UserStore } from "./userStore";
import { roleHandler, mentionHandler, emojiHandler, commandParser } from "./util";

const settingsStore = new SettingsStore(); //TODO make me env var (dont be lazy scoot scoot)

const client = new discord.Client();
const userStore = new UserStore();
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
        if (space == -1){
          photoUrl = photoString;
        }
        else {
          photoUrl = photoString.substr(0,space);
          name = photoString.substr(space+1);
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
        .setDescription(`<@${msg.member?.id}> made it rain with: ${amount}`);
      const numAmount = parseInt(amount);
      if (isNaN(numAmount)) {
        throw new Error(`Cannot make it rain with ${amount}`);
      }
      if (msg.guild) {
        userStore.makeItRain(
          numAmount,
          msg.guild.members.cache.map((m) => m.id)
        );
      }

      msg.channel.send(embed);
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
      console.log(person, msg.content);
      const hasRole = msg.member?.roles.cache.find((r) => r.id === settingsStore.settings.role)
      if (person) {
        if (!hasRole){// if not role giver then billem
          if (msg.member){
            if (!(userStore.getMyBalance(msg.member.id) >= numAmount)){
              throw new Error("Insufficient Funds");
            };
            userStore.billAccount(msg.member.id, numAmount);
          }
        }
        if (numAmount > 0 || hasRole) {//If amount > 0 or user has role(so they can bill whatever they want)
          userStore.addBucks(person, numAmount);
          msg.channel.send(
            new MessageEmbed()
              .setTitle(`${settingsStore.settings.currencyName} Aquired!`)
              .setDescription(
                `
            <@${person}>! <@${msg.member?.id}> has given you ${amount} ${settingsStore.settings.currencyName}
          `
              )
          );
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
              settingsStore.settings.photoBill
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
    if (reaction.message.member) {
      userStore.addBucks(
        reaction.message.member.id,
        settingsStore.settings.currencyValue
      );
      const embed = new MessageEmbed()
        .setTitle(`${settingsStore.settings.currencyName} Aquired!`)
        .setDescription(
          `
          <@${reaction.message.member.id}>! <@${member?.id}> has given you ${settingsStore.settings.currencyValue} ${settingsStore.settings.currencyName}
        `
        );
      reaction.message.channel.send(embed);
      logger.info(`added bucks ${reaction.message.member.displayName}`);
    }
  }
});
client.login(process.env.DISCORD_TOKEN);

import express from "express";

const app = express();
app.get("/", (req: any, res: any) => res.send("You have found the secret"));
app.listen(process.env.PORT, () => logger.info("Working"));
