//TODO settings stuff

import { Stores } from "../types";
import { Message } from "discord.js";
import { commandParser, changeSuccessful } from "../util";
import logger from "../logger";

export const settings = async (
  argString: string,
  { settingsStore }: Stores,
  msg: Message
) => {
  const clonedSettings = { ...settingsStore.settings };
  const [settingName, value] = commandParser(argString);
  logger.info(settingName);
  logger.info(value);

  if (Object.keys(settingsStore.settings).find((v) => v === settingName)) {
    let v;
    logger.info;
    logger.info(typeof (settingsStore.settings as any)[settingName]);
    switch (typeof (settingsStore.settings as any)[settingName]) {
      case "number":
        const numPrice = parseInt(value);

        if (isNaN(numPrice)) {
          throw new Error(`Price "${value}" is not a valid number`);
        }
        v = numPrice;
        break;
      case "string":
        v = value;
        break;
      default:
        throw new Error("Invalid type");
    }

    await settingsStore.setSettings({
      ...settingsStore.settings,
      [settingName]: v,
    });

    await msg.channel.send(
      changeSuccessful(settingName, value, (clonedSettings as any)[settingName])
    );
  } else {
    throw new Error("Invalid Setting Name");
  }
};
