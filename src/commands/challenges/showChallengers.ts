import { Message, MessageEmbed } from "discord.js";
import { SettingsStore } from "../../settingsStore";
import { commandParser } from "../../util";
import { ChallengeStore } from "../../challengeStore";
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
