// src/models/Pharmacy.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const PharmacySchema = new Schema({
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
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

PharmacySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Pharmacy', PharmacySchema);