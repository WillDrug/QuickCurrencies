import { Schema, model, Document } from "mongoose";

export interface Image {
  location: string;
  text?: string;
}

const schema = new Schema<Image>({
  location: { type: String, required: true },
  text: { type: String },
});

export const Image = model<Image & Document>("Image", schema);
