import logger from "./logger";
import { db } from "./dbConnection";
const COLLECTION_NAME = "members";

export class UserStore {
  constructor() {
    // pull state out of firestore and save here.
  }

  public async addBucks(uid: string, amount: number, from: string, to: string) {
    const currAmmount = (
      await db.collection(COLLECTION_NAME).doc(uid).get()
    ).data();
    let endAmm;
    if (currAmmount) {
      endAmm = Math.round(currAmmount.currency + amount);
    } else {
      endAmm = amount;
    }
    await db
      .collection(COLLECTION_NAME)
      .doc(uid)
      .set({ currency: endAmm }, { merge: true });
    logger.info(`${from} added ${amount} bucks to: ${to}`);
  }

  public async getTop(n: number): Promise<[string, number][]> {
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .orderBy("currency", "desc")
      .limit(n)
      .get();

    const status: [string, number][] = [];
    snapshot.forEach((sample) => {
      const data = sample.data();
      status.push([sample.id, data.currency]);
    });

    return status;
  }

  public async getMyBalance(id: string): Promise<number> {
    const d = await db.collection(COLLECTION_NAME).doc(id).get();
    const data = d.data();
    if (d.exists && data) {
      return data.currency;
    }
    return 0;
  }

  public async makeItRain(amount: number, members: string[], from: string) {
    const bpp = amount / members.length;
    await Promise.all(
      Array.from(members).map((id) =>
        this.addBucks(
          id,
          Math.round(bpp + Math.ceil(bpp * 0.1 * Math.random())),
          from,
          id
        )
      )
    );
  }

  public async getPhoto(): Promise<{ location: string; text?: string }> {
    const photos: { location: string; text?: string }[] = [];
    const snapShot = await db.collection("images").get();

    snapShot.forEach((e) => {
      photos.push(e.data() as any);
    });
    return photos[Math.floor(Math.random() * photos.length)];
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

  public addPhoto(url: string, name?: string) {
    db.collection("images")
      .doc()
      .set(name ? { location: url, text: name } : { location: url });
  }
}
