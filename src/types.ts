import { Message, Permissions, PermissionResolvable } from "discord.js";
import { SettingsStore } from "./stores/settingsStore";
import { ChallengeStore } from "./stores/challengeStore";
import { UserStore } from "./stores/userStore";
export interface Stores {
  settingsStore: SettingsStore;
  challengeStore: ChallengeStore;
  userStore: UserStore;
}
export interface Command {
  description: string;
  usage: string;
  func: (argString: string, stores: Stores, message: Message) => Promise<void>;
  permissions?: PermissionResolvable[];
  alias?: string[];
  requiresRole?: boolean;
}

export interface CommandSystem {
  [commandName: string]: Command;
}
