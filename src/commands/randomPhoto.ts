import { Message, MessageEmbed } from "discord.js";
import { Stores } from "../types";

export const randomPhoto = async (
  _: string,
  { userStore, settingsStore }: Stores,
  msg: Message
) => {
  if (msg.member) {
    const mem = msg.member;

    const b = await userStore.getMyBalance(msg.member.id);
    if (b < settingsStore.settings.photoBill) {
      throw new Error("Insufficient funds");
    }
    const p = await userStore.getPhoto();
    await userStore.billAccount(
      mem.id,
      settingsStore.settings.photoBill,
      "Random Photo",
      mem.displayName
    );
    const embed = new MessageEmbed()
      .setTitle(p.text || "Look at this photograph!")
      .setImage(p.location);
    await msg.channel.send(embed);
  }
};
