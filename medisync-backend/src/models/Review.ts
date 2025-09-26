// src/models/Review.ts
import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { IPharmacy } from './Pharmacy';

export interface IReview extends Document {
  user: IUser['_id'];
  pharmacy: IPharmacy['_id'];
  rating: number;
  comment: string;
}

const ReviewSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  pharmacy: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 }, // Rating must be between 1 and 5
  comment: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model<IReview>('Review', ReviewSchema);