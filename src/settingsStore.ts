import logger from "./logger";
import { db } from "./dbConnection";

export class SettingsStore {
  public settings: {
    role: string;
    emoji: string;
    delim: string;
    currencyValue: number;
    currencyName: string;
    photoBill: number;
  };

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
        this.setSettings(s);
      });
  }
  private setSettings(s: any) {
    this.settings = s;
  }

  private saveStore() {
    db.collection("settings")
      .doc("catscafe")
      .set(this.settings, { merge: true });
    logger.info("Saved store");
  }

  public setEmoji(emoji: string) {
    this.settings.emoji = emoji;
    this.saveStore();
  }

  public setRole(role: string) {
    this.settings.role = role;
    this.saveStore();
  }
  public setDelim(delim: string) {
    this.settings.delim = delim;
    this.saveStore();
  }
  public setCurrencyValue(val: number) {
    this.settings.currencyValue = val;
    this.saveStore();
  }
  public setCurrencyName(name: string) {
    this.settings.currencyName = name;
    this.saveStore();
  }

  public setPhotoPrice(price: number) {
    this.settings.photoBill = price;
    this.saveStore();
  }
}
