import { config } from "dotenv";
config();
import { MongoClient } from "mongodb";
import { writeFileSync } from "fs";

const main = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("not found");
  }
  const connection = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await connection.connect();
  const db = connection.db();

  const collections = await db.listCollections().toArray();
  const date = new Date();
  await Promise.all(
    collections.map(async (cName) => {
      writeFileSync(
        `${process.cwd()}/exports/${cName.name}-${date}.json`,
        JSON.stringify(
          await db.collection(cName.name).find().toArray(),
          null,
          2
        )
      );
    })
  );
  process.exit(0);
};
main();
