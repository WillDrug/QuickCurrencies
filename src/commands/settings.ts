//TODO settings stuff

import { Stores } from "../types";
import { Message } from "discord.js";
import { commandParser, changeSuccessful } from "../util";
import logger from "../logger";
import { settingTypes, settingsSetterSchema } from "../models/settings";

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
    logger.info;
    logger.info(typeof (settingsStore.settings as any)[settingName]);
    const settingType = settingsSetterSchema[settingName];
    const v = settingTypes[settingType].resolver(value);

    await settingsStore.setSettings({
      ...settingsStore.settings,
      [settingName]: v,
    });

    await msg.channel.send(
      changeSuccessful(settingName, v, (clonedSettings as any)[settingName])
    );
  } else {
    throw new Error("Invalid Setting Name");
  }
};
