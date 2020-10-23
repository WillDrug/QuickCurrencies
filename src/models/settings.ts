import { Schema, model, Document } from "mongoose";
import { roleHandler, emojiHandler, arrayHandler } from "../util";
export type Role = string;
export interface Settings {
  role: Role;
  emoji: string;
  delim: string;
  currencyValue: number;
  currencyName: string;
  photoBill: number;
  backgroundAmount: number;
  guildId: string;
  ignoreRole: Role;
  fineAmount: number;
  curses: Array<string>;
}

export enum SettingType {
  string = "string",
  number = "number",
  Role = "Role",
  Emote = "Emote",
  Array = "Array",
}

export const settingTypes: {
  [key in SettingType]: { resolver: (stringValue: string) => any };
} = {
  string: {
    resolver: (v) => v,
  },
  number: {
    resolver: (value) => {
      const numPrice = parseInt(value);

      if (isNaN(numPrice)) {
        throw new Error(`Price "${value}" is not a valid number`);
      }
    },
  },
  Role: {
    resolver: (v) => {
      const role = roleHandler(v)[0];
      if (!role) {
        throw new Error("Role not found");
      }
      return role;
    },
  },
  Emote: {
    resolver: (v) => {
      const emote = emojiHandler(v);
      return emote;
    },
  },
  Array: {
    resolver: (v) => {
      const arr = arrayHandler(v);
      return arr;
    }
  }
};

export const settingsSetterSchema: { [key: string]: SettingType } = {
  role: SettingType.Role,
  emoji: SettingType.Emote,
  delim: SettingType.string,
  currencyValue: SettingType.number,
  currencyName: SettingType.string,
  photoBill: SettingType.number,
  backgroundAmount: SettingType.number,
  ignoreRole: SettingType.Role,
  fineAmount: SettingType.number,
  curses: SettingType.Array
};

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
  ignoreRole: { type: String, required: true },
  fineAmount: { type: Number, required: true },
  curses: { type: Array, required: false },
});

export const Settings = model<Settings & Document>("Settings", settingsSchema);
