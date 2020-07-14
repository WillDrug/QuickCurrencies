// TODO ADD THIS FILE

import { Stores } from "../types";
import { Message, MessageEmbed } from "discord.js";

export const addPhoto = async (
  photoString: string,
  { userStore }: Stores,
  msg: Message
) => {
  const space = photoString.indexOf(" ");
  let photoUrl;
  let name;
  if (space == -1) {
    photoUrl = photoString;
  } else {
    photoUrl = photoString.substr(0, space);
    name = photoString.substr(space + 1);
  }
  await userStore.addPhoto(photoUrl, name);
  await msg.channel.send(
    new MessageEmbed().setTitle("Photo Added").setImage(photoUrl)
  );
};
