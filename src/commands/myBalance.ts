import { Message, MessageEmbed } from "discord.js";
import { Stores } from "../types";

export const myBalance = async (
  _: string,
  { userStore, settingsStore }: Stores,
  msg: Message
) => {
  if (msg.member) {
    const balance = await userStore.getMyBalance(msg.member.id);
    const embed = new MessageEmbed()
      .setTitle(`${msg.member.nickname || msg.member.displayName}'s Balance!`)
      .setDescription(
        `You currently have: \n${balance}\n ${settingsStore.settings.currencyName}`
      );
    msg.channel.send(embed);
  }
};
