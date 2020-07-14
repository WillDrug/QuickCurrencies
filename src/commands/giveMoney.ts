import { Message } from "discord.js";
import { mentionHandler, givenMoney, errorEvent } from "../util";
import logger from "../logger";
import { Stores } from "../types";

export const giveMoney = async (
  args: string,
  { settingsStore, userStore }: Stores,
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
  if (person) {
    if (numAmount > 0) {
      if (msg.member) {
        const mem = msg.member;
        const b = await userStore.getMyBalance(mem.id);
        if (!(b >= numAmount)) {
          throw new Error("Insufficient Funds");
        }

        await userStore.addBucks(person, numAmount, mem.displayName, person);

        await userStore.billAccount(mem.id, numAmount, person, mem.displayName);
        await msg.channel.send(
          givenMoney(
            numAmount,
            mem.id,
            person,
            settingsStore.settings.currencyName
          )
        );
      }
    }
  }
  return;
};
