// src/config/db.ts
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // This line reads the connection string from your .env file and connects to the database
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    const error = err as Error;
    console.error(`Error: ${error.message}`);
    // If it fails to connect, the application will stop
    process.exit(1);
  }
};

export default connectDB;