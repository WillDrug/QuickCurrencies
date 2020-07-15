import { Message } from "discord.js";
import { Stores } from "../../types";

export const showChallenges = async (
  name: string,
  { challengeStore }: Stores,
  msg: Message
) => {
  if (name) {
    const challenge = await challengeStore.specificChallengeStatus(name);
    msg.channel.send(challenge);
  } else {
    await challengeStore.listChallenges(msg.channel);
  }
};
