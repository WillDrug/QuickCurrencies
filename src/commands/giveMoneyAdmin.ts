import { Message } from "discord.js";
import { commandParser, errorEvent, mentionHandler, givenMoney } from "../util";
import { SettingsStore } from "../settingsStore";
import { UserStore } from "../userStore";
import logger from "../logger";
import { Stores } from "../types";

export const giveMoneyAdmin = async (
  args: string,
  { userStore, settingsStore }: Stores,
  msg: Message
) => {
  const arrayArgs = args.split(" ");
  const person = mentionHandler(arrayArgs[0])[0];

  const amount = arrayArgs[1];
  const numAmount = parseInt(amount);
  if (isNaN(numAmount)) {
    throw new Error("Invalid number");
  }
  logger.info(person, msg.content);

  if (person && msg.member) {
    await userStore.addBucks(person, numAmount, msg.member.id, person);
    await msg.channel.send(
      givenMoney(
        numAmount,
        msg.member.id,
        person,
        settingsStore.settings.currencyName
      )
    );
  }
};
