import { config } from "dotenv";
config();

import admin from "firebase-admin";
import fs from "fs";
import { MongoClient } from "mongodb";

if (
  !(process.env.PERM_STRING || process.env.PERM_LOCATION) ||
  !process.env.DB_LOCATION ||
  !process.env.MONGODB_URI
) {
  throw new Error("PERM_LOCATION or DB_LOCATION not set");
}
const serviceAccount = JSON.parse(
  process.env.PERM_STRING ||
    fs
      .readFileSync(`${process.cwd()}/${process.env.PERM_LOCATION || ""}`)
      .toString()
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DB_LOCATION,
});

const firestore = admin.firestore();

const client = new MongoClient(process.env.MONGODB_URI);

async function main() {
  try {
    await client.connect();
    const db = await client.db();
    const collections = await firestore.listCollections();

    await Promise.all(
      collections.map(async (c) => {
        console.log(`Starting Insert to "${c.id}"`);
        const snapshot = await firestore.collection(c.id).get();
        const samples: { _id: string }[] = [];
        snapshot.forEach(async (sample) => {
          samples.push({ _id: sample.id, ...sample.data() });
        });
        await db.collection(c.id).insertMany(samples);
        console.log(`Finished Insert to "${c.id}"`);
      })
    );

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
