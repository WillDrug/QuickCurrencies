import { TextChannel, MessageEmbed, DMChannel, NewsChannel } from "discord.js";
import { db } from "./dbConnection";
import logger from "./logger";
const CHALLENGE_COLLECTION = "challenge";

export interface Challenge {
  currentAmount: number;
  description: string;
  name: string;
  target: number;
}

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

export class ChallengeStore {
  constructor() {}

  public async listChallenges(channel: TextChannel | DMChannel | NewsChannel) {
    const snapshot = await db.collection(CHALLENGE_COLLECTION).get();

    let challengeString = "All Challenges!: \n";
    snapshot.forEach((challenge) => {
      const data: Challenge = challenge.data() as Challenge;
      challengeString += `${data.name}: \`${data.currentAmount}/${
        data.target
      }[${Math.floor((data.currentAmount / data.target) * 100)}]%\`\n${
        data.description
      }`;
    });

    channel.send(
      new MessageEmbed()
        .setTitle("Current Challenges!")
        .setDescription(challengeString)
    );
  }
  public async specificChallengeStatus(
    challengeName: string
  ): Promise<MessageEmbed> {
    const [challengeId, challenge] = await this.getChallenge(challengeName);
    const percent = challenge.currentAmount / challenge.target;

    return new MessageEmbed()
      .setTitle("Challenge Status!")
      .setDescription(
        `The ${challengeName} challenge is currently at ${Math.floor(
          percent * 100
        )}% \`[${challenge.currentAmount}/${challenge.target}]\``
      )
      .setImage(percentageMappings[Math.floor(percent * 10)]);
  }

  private async getChallenge(
    challengeName: string
  ): Promise<[string, Challenge]> {
    const challenge = (
      await db
        .collection(CHALLENGE_COLLECTION)
        .where("name", "==", challengeName)
        .limit(1)
        .get()
    ).docs[0];
    if (!challenge) throw new Error("Invalid Challenge Name");
    return [challenge.id, challenge.data() as Challenge];
  }
  public async addToChallenge(amount: number, challengeName: string) {
    const [challengeId, challenge] = await this.getChallenge(challengeName);
    await db
      .collection(CHALLENGE_COLLECTION)
      .doc(challengeId)
      .set(
        { currentAmount: challenge.currentAmount + amount },
        { merge: true }
      );
  }
}
