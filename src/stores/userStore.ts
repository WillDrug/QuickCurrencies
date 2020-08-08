import logger from "../logger";
import { Member } from "../models/member";
import { Image } from "../models/image";

export class UserStore {
  public async addBucks(uid: string, amount: number, from: string, to: string) {
    logger.info(
      await Member.updateOne(
        { _id: uid },
        { _id: uid, $inc: { currency: Math.round(amount) } },
        { upsert: true }
      )
    );

    logger.info(`${from} added ${amount} bucks to: ${to}`);
  }

  public async getTop(n: number): Promise<[string, number][]> {
    const docs = await Member.find().sort({ currency: -1 }).limit(n);
    const status: [string, number][] = [];
    docs.forEach((m) => {
      status.push([m.id as string, m.currency]);
    });
    return status;
  }

  public async getMyBalance(id: string): Promise<number> {
    const m = await Member.findById(id);
    if (m) {
      return m.currency;
    }
    return 0;
  }

  public async makeItRain(amount: number, members: string[], from: string) {
    const bpp = amount / members.length;
    await Member.updateMany(
      { _id: { $in: members } },
      {
        $inc: { currency: Math.round(bpp) },
      }
    );
  }

  public async getPhoto(): Promise<Image> {
    return (await Image.aggregate<Image>([{ $sample: { size: 1 } }]))[0];
  }

  public async billAccount(
    id: string,
    amount: number,
    from: string,
    to: string
  ) {
    if (amount < 0) {
      throw new Error("Tried to bill negative");
    }
    await this.addBucks(id, -amount, from, to);
  }

  public async addPhoto(url: string, name?: string) {
    await new Image({ location: url, name }).save();
  }
}
