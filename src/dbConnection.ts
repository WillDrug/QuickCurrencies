import mongoose from "mongoose";
if (!process.env.MONGODB_URI) throw new Error("DB URI not set");

export const db = mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
