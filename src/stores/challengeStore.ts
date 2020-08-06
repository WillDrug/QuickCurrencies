import { TextChannel, MessageEmbed, DMChannel, NewsChannel } from "discord.js";
import { Challenge } from "../models/challenge";

const percentageMappings = [
  "https://media.discordapp.net/attachments/711291510414376970/725425186911944714/Progress_Bar_0.png",
  "https://media.discordapp.net/attachments/711291510414376970/725425211876311133/Progress_Bar_10.png",
  "https://media.discordapp.net/attachments/711291510414376970/725425225600204830/Progress_Bar_20.png",
  "https://media.discordapp.net/attachments/711291510414376970/725425239617699900/Progress_Bar_30.png",
  "https://media.discordapp.net/attachments/711291510414376970/725425254570131466/Progress_Bar_40.png",
  "https://media.discordapp.net/attachments/711291510414376970/725425275407695892/Progress_Bar_50.png",
  "https://media.discordapp.net/attachments/711291510414376970/725425293556449410/Progress_Bar_60.png",
  "https://media.discordapp.net/attachments/711291510414376970/725425308630777866/Progress_Bar_70.png",
  "https://media.discordapp.net/attachments/711291510414376970/725425321628663818/Progress_Bar_80.png",
  "https://media.discordapp.net/attachments/711291510414376970/725425333008072754/Progress_Bar_90.png",
  "https://media.discordapp.net/attachments/711291510414376970/725425351223934996/Progress_Bar_100.png",
];

const OVERFLOW_IMAGE =
  "https://cdn.discordapp.com/attachments/711291510414376970/725766604125896734/Progress_Bar_Overfill.png";

export class ChallengeStore {
  public async listChallenges(channel: TextChannel | DMChannel | NewsChannel) {
    // TODO dont send message here.
    const challengeString = (await Challenge.find()).reduce(
      (c, data) =>
        `${c}${data.name}: \`${data.currentAmount}/${data.target}[${Math.floor(
          (data.currentAmount / data.target) * 100
        )}]%\`\n${data.description}\n`,
      "All Challenges!: \n"
    );

    channel.send(
      new MessageEmbed()
        .setTitle("Current Challenges!")
        .setDescription(challengeString)
    );
  }
  public async specificChallengeStatus(
    challengeName: string
  ): Promise<MessageEmbed> {
    const challenge = await this.getChallenge(challengeName);
    const percent = challenge.currentAmount / challenge.target;
    return new MessageEmbed()
      .setTitle("Challenge Status!")
      .setDescription(
        `The ${challengeName} challenge is currently at ${Math.floor(
          percent * 100
        )}% \`[${challenge.currentAmount}/${challenge.target}]\``
      )
      .setImage(
        percent >= 1
          ? OVERFLOW_IMAGE
          : percentageMappings[Math.floor(percent * 10)]
      );
  }

  private async getChallenge(challengeName: string): Promise<Challenge> {
    const challenge = (await Challenge.find({ name: challengeName }))[0];
    if (!challenge) throw new Error("Invalid Challenge Name");
    return challenge;
  }
  public async addToChallenge(amount: number, challengeName: string) {
    await Challenge.update(
      { name: challengeName },
      { $inc: { currentAmount: amount } }
    );
  }
}
