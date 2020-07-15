import logger from "../logger";
import { db } from "../dbConnection";

export interface Settings {
  role: string;
  emoji: string;
  delim: string;
  currencyValue: number;
  currencyName: string;
  photoBill: number;
}
export class SettingsStore {
  public settings: Settings;

  constructor() {
    this.settings = {
      role: "",
      emoji: "",
      delim: "",
      currencyValue: 1,
      currencyName: "",
      photoBill: 1,
    };
    db.collection("settings")
      .doc("catscafe")
      .get()
      .then((d) => {
        const s = d.data();
        logger.info({ msg: "Loaded settings:", s });
        this.setSettingsAfterLoad(s);
      });
  }
  private setSettingsAfterLoad(s: any) {
    this.settings = s;
  }

  private async saveStore() {
    await db
      .collection("settings")
      .doc("catscafe")
      .set(this.settings, { merge: true });
    logger.info("Saved store");
  }

  public async setSettings(settings: Settings) {
    this.settings = settings;
    await this.saveStore();
  }
}
