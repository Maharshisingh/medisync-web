// src/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin'; // Role is included
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  // The role field with a default value
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user', 
  },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);