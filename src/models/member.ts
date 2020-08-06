import { Schema, model, Document } from "mongoose";

export interface Member {
  currency: number;
}
const schema = new Schema<Member>({
  _id: { type: String, required: true },
  currency: { type: Number, required: true },
});

export const Member = model<Member & Document>("Member", schema);
