// src/models/Prescription.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const PrescriptionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending',
  },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Prescription', PrescriptionSchema);