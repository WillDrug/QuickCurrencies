import { Member } from "../models/member";
import { Stores } from "../types";
import { Message, MessageEmbed } from "discord.js";

export const userSync = async (_1: string, _2: Stores, msg: Message) => {
  if (!msg.guild) {
    throw new Error("Guild unreachable");
  }
  const serverMembers = msg.guild.members.cache.map((u) => u.id);

  if (serverMembers) {
    const dBids = (await Member.find()).map((u) => u._id);

    const usersToSave = serverMembers
      .reduce((acc, serverMember) => {
        if (dBids.includes(serverMember)) {
          return [...acc];
        } else {
          return [...acc, serverMember];
        }
      }, [] as string[])
      .map((id) => ({ _id: id, currency: 1000 }));

    const result = await Member.insertMany(usersToSave);
    const deleteResult = await Member.deleteMany({
      _id: { $not: { $in: serverMembers } },
    });
    await msg.channel.send(
      new MessageEmbed().setTitle("User Sync").setDescription(`
    Inserted: ${usersToSave.length}
    Deleted: ${deleteResult.deletedCount}
    `)
    );
  } else {
    throw new Error("No Server Members ? HOw?!?!");
  }
};
