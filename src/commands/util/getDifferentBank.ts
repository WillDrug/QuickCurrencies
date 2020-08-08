import { Message, MessageEmbed } from "discord.js";
import { Stores } from "../../types";
import { Member } from "../../models/member";

export const getDifferentBank = async (
  arg: string,
  stores: Stores,
  msg: Message
) => {
  const member = await Member.findById(arg);
  console.log(member);
  if (!member) {
    throw new Error(`Member ${arg} not found`);
  }

  await msg.channel.send(
    new MessageEmbed()
      .setTitle("Member details")
      .setDescription(JSON.stringify(member.toJSON(), null, 2))
  );
};
