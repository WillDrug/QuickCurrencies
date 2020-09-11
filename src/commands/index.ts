import { CommandSystem, Command } from "../types";
import { getSettings } from "./getSettings";
import { giveMoney } from "./giveMoney";
import { leaderboard } from "./leaderboard";
import { myBalance } from "./myBalance";
import { makeItRain } from "./makeItRain";
import { giveMoneyAdmin } from "./giveMoneyAdmin";
import { randomPhoto } from "./randomPhoto";
import { showChallenges } from "./challenges/showChallengers";
import { donateToChallenge } from "./challenges/donateToChallenge";
import { addPhoto } from "./addPhoto";
import { helpCommand } from "./help";
import { settings } from "./settings";
import { getOnline } from "./util/getOnline";
import { userSync } from "./util/userSync";
import { getDifferentBank } from "./util/getDifferentBank";
import { PoliceOfficer } from "./laws"

const baseCommands: CommandSystem = {
  settings: {
    alias: ["set"],
    description:
      "Control settings of Quick Currenies on this server, use =getSettings to show valid settings",
    usage: "=settings <settingName> <value>",
    func: settings,
    permissions: ["ADMINISTRATOR"],
  },
  gm: {
    alias: ["giveMoney"],
    description: "give money to another person from your own account",
    usage: "=gm @User <amount>",
    func: giveMoney,
  },

  getSettings: {
    description: "Get current settings for this server",
    usage: "=getSettings",
    func: getSettings,
  },

  leaderBoard: {
    alias: ["lb"],
    description: "See the richest people on the server",
    usage: "=lb|leaderboard",
    func: leaderboard,
  },

  myBalance: {
    alias: ["b"],
    description: "Check your balance",
    usage: "=myBalance",
    func: myBalance,
  },

  makeItRain: {
    alias: ["mir"],
    description: "Admin Command: Spread some money around",
    usage: "=mir <amount>",
    func: makeItRain,
    requiresRole: true,
  },
  giveMoneyAdmin: {
    alias: ["gma"],
    description: "Give money as an admin",
    usage: "=gma @User <amount>",
    requiresRole: true,
    func: giveMoneyAdmin,
  },

  randomPhoto: {
    description: "Displays a random photo",
    usage: "=randomPhoto",
    func: randomPhoto,
  },

  showChallenges: {
    alias: ["sc"],
    description:
      "Show current challenges or show a specific challenge if given a challenge Name",
    usage: "=sc [challengeName]",
    func: showChallenges,
  },

  donateToChallenge: {
    alias: ["dc"],
    description: "Donate to a specifc challenge",
    usage: "=dc <challenge name>",
    func: donateToChallenge,
  },

  addPhoto: {
    description: "Add a photo to the photo store",
    usage: "=addPhoto <photo link> [photo title]",
    func: addPhoto,
    permissions: ["ADMINISTRATOR"],
  },
  onlineMembers: {
    description: "Get number of members online",
    usage: "=onlineMembers",
    func: getOnline,
    permissions: ["ADMINISTRATOR"],
  },
  userSync: {
    description: "Sync Members to db",
    usage: "=userSync",
    func: userSync,
    permissions: ["ADMINISTRATOR"],
  },

  getDifferentBank: {
    description: "[ADMIN ONLY] Get amount in different account",
    usage: "=getDifferentBank",
    func: getDifferentBank,
    permissions: ["ADMINISTRATOR"],
  },
};

const baseCommandsByAlias: CommandSystem = Array.from(
  Object.entries(baseCommands)
).reduce((acc, [name, command]) => {
  return {
    [name]: command,
    ...acc,
    ...command.alias?.reduce(
      (liasAcc, aliasName) => ({ ...liasAcc, [aliasName]: command }),
      {}
    ),
  };
}, {});

const help: Command = {
  description: "get help with a command",
  func: helpCommand(baseCommands, baseCommandsByAlias),
  usage: "=help",
};

export const commands: CommandSystem = {
  ...baseCommands,
  help,
};

export const commandsByAlias: CommandSystem = {
  ...baseCommandsByAlias,
  help,
};

// Input routes which will be ignored
export const prohibitedCommands = ['=\\', '=/'];
export const policeOfficer = new PoliceOfficer();