import { Schema, model, Document } from "mongoose";

export interface Settings {
  role: string;
  emoji: string;
  delim: string;
  currencyValue: number;
  currencyName: string;
  photoBill: number;
  backgroundAmount: number;
  guildId: string;
}

const settingsSchema = new Schema<Settings>({
  _id: { type: String, required: true },
  role: { type: String, required: true },
  emoji: { type: String, required: true },
  delim: { type: String, required: true },
  currencyValue: { type: Number, required: true },
  currencyName: { type: String, required: true },
  photoBill: { type: Number, required: true },
  backgroundAmount: { type: Number, required: true },
  guildId: { type: String, required: false },
});

export const Settings = model<Settings & Document>("Settings", settingsSchema);
