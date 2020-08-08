import { Message } from "discord.js";
import { Stores } from "../../types";

export const getOnline = async (_: string, _2: Stores, msg: Message) => {
  msg.channel.send(
    `<@${msg.member?.id}> ${
      msg.guild?.members.cache.filter((mmb) => mmb.presence.status === "online")
        .size
    }`
  );
};
