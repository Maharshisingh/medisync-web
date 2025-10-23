// src/models/Medicine.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const MedicineSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  manufacturer: { type: String },
  composition: [String],
}, { timestamps: true });

module.exports = mongoose.model('Medicine', MedicineSchema);