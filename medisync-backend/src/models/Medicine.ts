// src/models/Medicine.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IMedicine extends Document {
  name: string;
  manufacturer?: string;
  composition?: string[];
}

const MedicineSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  manufacturer: { type: String },
  composition: [String],
}, { timestamps: true });

export default mongoose.model<IMedicine>('Medicine', MedicineSchema);