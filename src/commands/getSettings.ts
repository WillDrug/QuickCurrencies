import { Message, MessageEmbed } from "discord.js";
import { SettingsStore } from "../settingsStore";
import { Stores } from "../types";

export const getSettings = async (
  _args: string,
  { settingsStore }: Stores,
  msg: Message
) => {
  const clonedSettings = { ...settingsStore.settings };
  clonedSettings.role = `<@&${clonedSettings.role}>`;
  clonedSettings.emoji = `<:${clonedSettings.emoji}:>`;
  const embed = new MessageEmbed()
    .setTitle("Current QuickCurrency Settings:")
    .setColor("#e5ff00")
    .setDescription(JSON.stringify(clonedSettings, null, 2));
  msg.channel.send(embed);
};
