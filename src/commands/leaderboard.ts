import { Message, MessageEmbed } from "discord.js";
import { Stores } from "../types";

export const leaderboard = async (
  _: string,
  { userStore }: Stores,
  msg: Message
) => {
  const topTen = await userStore.getTop(10);
  const embed = new MessageEmbed()
    .setTitle("The richest people in the guild!")
    .setColor("#fc8c03")
    .setDescription(
      topTen.reduce(
        (curr, record) => curr + `\n <@${record[0]}> | ${record[1]}`,
        ""
      )
    );

  await msg.channel.send(embed);
};
