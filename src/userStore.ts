import admin from "firebase-admin";
import logger from "./logger";
import { MessageEmbed } from "discord.js";
if (!(process.env.PERM_STRING && process.env.DB_LOCATION)){
  throw new Error("PERM_LOCATION or DB_LOCATION not set")
}
const serviceAccount = JSON.parse(process.env.PERM_STRING);
const COLLECTION_NAME = "members";
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DB_LOCATION
});

const db = admin.firestore();
const save = (store: Map<string, number>) => {
  Array.from(store.entries()).forEach(([key, val]) => {
    db.collection("members").doc(key).set({ currency: val });
  });
  logger.info("Saved to db");
};

export class UserStore {
  private store: Map<string, number> = new Map();
  constructor() {
    // pull state out of firestore and save here.
    db.collection("members")
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          this.store.set(doc.id, doc.data().currency);
        });
      });
    setInterval(
      () => save(this.store),
      parseInt(process.env.SAVE_INTERVAL_MS || (5 * 60 * 1000).toString())
    );
  }

  public saveToFireStore() {
    save(this.store);
  }

  public addBucks(uid: string, amount: number) {
    const currAmmount = this.store.get(uid);
    if (currAmmount) {
      this.store.set(uid, currAmmount + amount);
    } else {
      this.store.set(uid, amount);
    }
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

  public async getPhoto(): Promise<string> {
    const photos: string[] = [];
    const snapShot = await db.collection("images").get();

    snapShot.forEach((e) => {
      photos.push(e.data().location);
    });
    return photos[Math.floor(Math.random() * (photos.length))];
  }

  public billAccount(id: string, amount: number) {
    this.addBucks(id, -amount);
  }

  public addPhoto(url: string) {
    db.collection("images").doc().set({ location: url });
  }
}
