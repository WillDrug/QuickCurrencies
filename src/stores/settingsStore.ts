import logger from "../logger";
import { Settings } from "../models/settings";
import { Db } from "mongodb";
export class SettingsStore {
  public settings: Settings;

  constructor() {
    const settings = {
      role: "",
      emoji: "",
      delim: "",
      currencyValue: 1,
      currencyName: "",
      photoBill: 1,
      backgroundAmount: 10,
      guildId: "",
      ignoreRole: "",
    };
    this.settings = settings;

    Settings.findById("catscafe").then((s) => {
      logger.info({ msg: "Loaded settings:", ...s?.toJSON() });
      this.setSettingsAfterLoad({ ...settings, ...s?.toJSON() });
    });
  }
  private setSettingsAfterLoad(s: any) {
    this.settings = s;
  }

  private async saveStore() {
    await Settings.updateOne({ _id: "catscafe" }, { $set: this.settings });
    logger.info("Saved store");
  }

  public async setSettings(settings: Settings) {
    this.settings = settings;
    await this.saveStore();
  }

  public async getAllSettings(): Promise<Settings[]> {
    return await Settings.find();
  }
}
