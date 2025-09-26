// src/models/Prescription.ts
import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IPrescription extends Document {
  user: IUser['_id'];
  imageUrl: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  notes?: string;
}

const PrescriptionSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  // In a real app, this URL would come from a cloud storage service like AWS S3 or Cloudinary
  imageUrl: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending',
  },
  notes: { type: String }, // For admin feedback
}, { timestamps: true });

export default mongoose.model<IPrescription>('Prescription', PrescriptionSchema);