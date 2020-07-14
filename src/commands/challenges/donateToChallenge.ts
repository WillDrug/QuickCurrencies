import { Message, MessageEmbed } from "discord.js";
import { errorEvent } from "../../util";
import logger from "../../logger";
import { Stores } from "../../types";

export const donateToChallenge = async (
  amount_name_str: string,
  { settingsStore, challengeStore, userStore }: Stores,
  msg: Message
) => {
  const split = amount_name_str.split(" ");
  if (split.length >= 2 && msg.member) {
    const member = msg.member;
    const amount = split[split.length - 1];
    const name = split.slice(0, split.length - 1).join(" ");
    const numAmount = parseInt(amount);
    if (isNaN(numAmount)) throw new Error("Invalid Number");
    if (numAmount > 0) {
      const b = await userStore.getMyBalance(member.id);
      if (b < numAmount) throw new Error("Insufficient funds");
      await challengeStore.addToChallenge(numAmount, name);
      await userStore.billAccount(
        member.id,
        numAmount,
        member.displayName,
        name
      );

      await msg.channel.send(
        new MessageEmbed()
          .setTitle(`Donation to the ${name} challenge fund!`)
          .setDescription(
            `<@${member.id}> just donated ${amount} ${settingsStore.settings.currencyName} to the ${name} challenge fund!`
          )
          .setImage(
            "https://media.giphy.com/media/xTiTnqUxyWbsAXq7Ju/giphy.gif"
          )
      );
      logger.info(
        `${member.displayName} donated ${amount} to: ${name} Challenge!`
      );
    }
  } else {
    throw new Error(
      "Invalid format, use =dc <CHALLENGE NAME> <DONATE AMOUNT> "
    );
  }
};
