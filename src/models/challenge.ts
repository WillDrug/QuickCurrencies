import { Schema, model, Document } from "mongoose";

export interface Challenge {
  currentAmount: number;
  description: string;
  name: string;
  target: number;
}

const schema = new Schema<Challenge>({
  currentAmount: { type: Number, required: true },
  description: { type: String, required: true },
  name: { type: String, required: true },
  target: { type: Number, required: true },
});

export const Challenge = model<Challenge & Document>("Challenge", schema);
