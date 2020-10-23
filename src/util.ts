import {
  MessageEmbed,
  Message,
  TextChannel,
  DMChannel,
  NewsChannel,
} from "discord.js";
import logger from "./logger";

const roleRegex = /<@&(\d+)>/g;
export const roleHandler = (src: string): string[] => {
  const matches = src.match(roleRegex);
  return matches
    ? matches.map((match) => match.substr(3).replace(">", ""))
    : [];
}; //return array of ids from string;

export const caseInsensitiveComparator = (key: string, dict: Record<string, any>): string => {
  for (var k in dict) {
    if (k.toLowerCase() == key.toLowerCase()) {
      return k;
    }
  };
  return "";
}

export const emojiHandler = (emojiString: string): string => {
  if (emojiString.startsWith("<")) {
    return emojiString.split(":")[2].replace(">", "");
  } else {
    return emojiString;
  }
};

export const commandParser = (cmd: string): [string, string] => {
  const spaceLocation = cmd.indexOf(" ");
  if (spaceLocation < 0) return [cmd, ""];
  const emote = cmd.substr(spaceLocation + 1);
  const command = cmd.substr(0, spaceLocation);
  return [command, emote];
};

export const mentionHandler = (src: string): string[] => {
  const matches = src.match(/<@!?(\d+)>/g);
  return matches
    ? matches.map((match) => match.substr(2).replace(">", "").replace("!", ""))
    : [];
}; //return array of ids from string;

export const givenMoney = (
  amount: number,
  from: string,
  to: string,
  currencyName: string
): MessageEmbed => {
  let gif;
  if (Math.random() < 0.05) {
    gif =
      "https://cdn.discordapp.com/attachments/728292914224037908/740644612464574524/sad_mattbucks.gif";
  } else {
    gif = "https://media.giphy.com/media/YBsd8wdchmxqg/giphy.gif";
  }

  return new MessageEmbed()
    .setTitle(`${currencyName} Acquired!`)
    .setDescription(
      `
<@${to}>! <@${from}> has given you ${amount} ${currencyName}
`
    )
    .setImage(gif);
};

export const errorEvent = (e: Error) => {
  logger.error(e);
  return new MessageEmbed()
    .setTitle("ERROR!")
    .setColor("#ad0000")
    .setDescription(`Your last command failed: ${e.message}`);
};

export const changeSuccessful = (
  fieldName: string,
  givenValue: string,
  originalValue: string
) =>
  new MessageEmbed()
    .setTitle("Update Successful!")
    .setColor("#20fc03")
    .setDescription(`*${fieldName}:* \n ${originalValue} => ${givenValue}`);

export const memberIsIgnored = (
  msg: Message,
  personId: string,
  ignoreRole: string
) => {
  const member = msg.guild?.members.cache.find((m) => m.id === personId);
  if (member && member.roles.cache.find((r) => r.id === ignoreRole)) {
    throw new Error(`Memeber Has the ignore role <@&${ignoreRole}>`);
  }
};
