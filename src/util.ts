import { MessageEmbed, Message } from "discord.js";

const roleRegex = /<@&(\d+)>/g;
export const roleHandler = (src: string): string[] => {
  const matches = src.match(roleRegex);
  return matches
    ? matches.map((match) => match.substr(3).replace(">", ""))
    : [];
}; //return array of ids from string;

export const emojiHandler = (emojiString: string): string => {
  if (emojiString.startsWith("<")) {
    return emojiString.split(":")[2].replace(">", "");
  } else {
    return emojiString;
  }
};

export const commandParser = (cmd: string): [string, string] => {
  const spaceLocation = cmd.indexOf(" ");
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
): MessageEmbed =>
  new MessageEmbed()
    .setTitle(`${currencyName} Aquired!`)
    .setDescription(
      `
<@${to}>! <@${from}> has given you ${amount} ${currencyName}
`
    )
    .setImage("https://media.giphy.com/media/YBsd8wdchmxqg/giphy.gif");
