require("dotenv").config();
const admin = require("firebase-admin");
const fs = require("fs");
admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.PERM_STRING) ||
      JSON.parse(fs.readFileSync(process.env.PERM_STRING_LOCATION))
  ),
});

const db = admin.firestore();
const main = async () => {
  const s = await db.collection("members").get();

  let t = 0;

  s.forEach((f) => {
    t += f.data().currency;
  });

  console.log(t);
};

main();
