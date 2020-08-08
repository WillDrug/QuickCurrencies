import { Stores, CommandSystem } from "../types";
import { Message, MessageEmbed } from "discord.js";

export const helpCommand = (
  commands: CommandSystem,
  commandsByAlias: CommandSystem
) => async (arg: string, _2: Stores, msg: Message) => {
  const embded = new MessageEmbed();
  if (!arg) {
    embded.setTitle("Quick Currencies Commands").setDescription(
      Array.from(Object.entries(commands)).reduce(
        (acc, [commandName, command]) =>
          `
${acc}
- ${commandName}: ${command.description}
`,
        ""
      )
    );
  } else {
    if (commandsByAlias[arg]) {
      const command = commandsByAlias[arg];
      embded.setTitle(`${arg}`);
      embded.setDescription(
        `
Description:
    ${command.description}

Aliases:
    ${command.alias?.reduce((acc, alias) => `${acc}${alias}\n`, "") ?? "None"}
Usage:
    ${command.usage}

Permissions:
    ${
      command.permissions?.reduce((acc, perm) => `${acc}${perm}\n`, "") ??
      "None"
    }
Requires Role:
    ${!!command.requiresRole}
`
      );
    } else {
      throw new Error("Help: Unknown command");
    }
  }
  await msg.channel.send(embded);
};
