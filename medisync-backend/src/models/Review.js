// src/models/Review.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  pharmacy: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);