import logger from "./logger";
import { db } from "./dbConnection";
const COLLECTION_NAME = "members";

const save = (store: Map<string, number>, diffQueue: string[]) => {
  diffQueue.forEach((uid) => {
    const val = store.get(uid);
    if (val) {
      db.collection(COLLECTION_NAME).doc(uid).set({ currency: val });
    }
  });
  diffQueue.splice(0, diffQueue.length);
  logger.info("Saved to db");
};

export class UserStore {
  private store: Map<string, number> = new Map();
  private diffQueue: string[] = [];
  constructor() {
    // pull state out of firestore and save here.
    db.collection(COLLECTION_NAME)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          this.store.set(doc.id, doc.data().currency);
        });
      });
    setInterval(
      () => save(this.store, this.diffQueue),
      parseInt(process.env.SAVE_INTERVAL_MS || (5 * 60 * 1000).toString())
    );
  }

  public saveToFireStore() {
    save(this.store, this.diffQueue);
  }

  public addBucks(uid: string, amount: number) {
    const currAmmount = this.store.get(uid);
    if (currAmmount) {
      this.store.set(uid, Math.round(currAmmount + amount));
    } else {
      this.store.set(uid, amount);
    }

    this.diffQueue.push(uid);
  }

  public getTop(n: number) {
    const sorted = Array.from(this.store.entries()).sort((a, b) => {
      if (a[1] > b[1]) return -1;
      if (a[1] < b[1]) return 1;
      return 0;
    });

    return sorted.slice(0, n);
  }

  public getMyBalance(id: string): number {
    return this.store.get(id) || 0;
  }

  public makeItRain(amount: number, members: string[]) {
    const bpp = amount / this.store.size;
    Array.from(members).forEach((id) => {
      this.addBucks(id, bpp + Math.ceil(amount * 0.1 * Math.random()));
    });
  }

  public async getPhoto(): Promise<{ location: string; text?: string }> {
    const photos: { location: string; text?: string }[] = [];
    const snapShot = await db.collection("images").get();

    snapShot.forEach((e) => {
      photos.push(e.data() as any);
    });
    return photos[Math.floor(Math.random() * photos.length)];
  }

  public billAccount(id: string, amount: number) {
    if (amount < 0){
      throw new Error("Tried to bill negative")
    }
    this.addBucks(id, -amount);
  }

  public addPhoto(url: string, name?: string) {
    db.collection("images")
      .doc()
      .set(name ? { location: url, text: name } : { location: url });
  }
}
