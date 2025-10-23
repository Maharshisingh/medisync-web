// src/models/User.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user', 
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);