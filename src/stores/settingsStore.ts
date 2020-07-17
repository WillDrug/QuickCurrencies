import logger from "../logger";
import { db } from "../dbConnection";

export interface Settings {
  role: string;
  emoji: string;
  delim: string;
  currencyValue: number;
  currencyName: string;
  photoBill: number;
  backgroundAmount: number;
}
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
    };
    this.settings = settings;
    db.collection("settings")
      .doc("catscafe")
      .get()
      .then((d) => {
        const s = d.data();
        logger.info({ msg: "Loaded settings:", s });
        this.setSettingsAfterLoad({ ...settings, ...s });
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

  public async getAllSettings(): Promise<
    { backgroundAmount: number; guildId: string }[]
  > {
    const result = await db.collection("settings").get();
    const guilds: { backgroundAmount: number; guildId: string }[] = [];
    result.forEach((sample) => {
      const data = sample.data();
      const bgAmount = data.backgroundAmount || 10;
      guilds.push({ backgroundAmount: bgAmount, guildId: data.guildId });
    });
    return guilds;
  }
}
