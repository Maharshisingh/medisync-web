// src/models/Pharmacy.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IPharmacy extends Document {
    pharmacyName: string;
    email: string;
    password?: string;
    address: string;
    contactNumber: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    isApproved: boolean;
    rating: number;      // <-- New Field
    numReviews: number;  // <-- New Field
}

const PharmacySchema: Schema = new Schema({
  pharmacyName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  address: { type: String, required: true },
  contactNumber: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },
  isApproved: { type: Boolean, default: false },
  // Add these two new fields
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
}, { timestamps: true });

PharmacySchema.index({ location: '2dsphere' });

export default mongoose.model<IPharmacy>('Pharmacy', PharmacySchema);