const roleRegex = /<@&(\d+)>/g
export const roleHandler = (src: string): string[] => {
  const matches = src.match(roleRegex);
  return matches ? matches.map((match) => match.substr(3).replace(">", "")): [];
}; //return array of ids from string;

export const emojiHandler = (emojiString: string): string => {
  if (emojiString.startsWith("<")) {
    return emojiString.split(":")[2].replace(">", "");
  } else {
    return emojiString;
  }
};


export const commandParser = (cmd: string): [string, string] => {
  const spaceLocation = cmd.indexOf(" ");
  const emote = cmd.substr(spaceLocation + 1);
  const command = cmd.substr(0, spaceLocation);
  return [command, emote];
}