import admin from "firebase-admin";
import fs from "fs";

if (!(process.env.PERM_STRING || process.env.PERM_LOCATION) || !process.env.DB_LOCATION) {
  throw new Error("PERM_LOCATION or DB_LOCATION not set");
}
const serviceAccount = JSON.parse(
  process.env.PERM_STRING ||
    fs.readFileSync(`${process.cwd()}/${process.env.PERM_LOCATION || ""}`).toString()
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DB_LOCATION,
});

export const db = admin.firestore();
