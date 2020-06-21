import { fstat, writeFileSync, readFileSync } from "fs";
import logger from "./logger";
import { settings } from "cluster";


export class SettingsStore {
  public settings: {
    role: string;
    emoji: string;
    delim: string;
    currencyValue: number;
    currencyName: string;
    photoBill: number;
  }
  
  private location: string;

  constructor(config: { location: string }) {
    this.location = config.location
    const settings = JSON.parse(readFileSync(`${process.cwd()}/${this.location}`).toString())
    logger.info({msg: "Loaded settings:", settings});

    this.settings = settings;
  }

  private saveStore() {
    writeFileSync(
      `${process.cwd()}/${this.location}`,
      JSON.stringify(this.settings,null,2)
    );
    logger.info("Saved store")
  }

  public setEmoji(emoji: string){
    this.settings.emoji = emoji;
    this.saveStore()
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
    this.settings.currencyValue= val;
    this.saveStore();
  }
  public setCurrencyName(name: string){
    this.settings.currencyName = name;
    this.saveStore()
  }

  public setPhotoPrice(price: number){
    this.settings.photoBill = price;
    this.saveStore();
  }

}
