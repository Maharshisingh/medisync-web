// src/server.ts
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';

// Import all of our route files
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import pharmacyRoutes from './routes/pharmacyRoutes';
import adminRoutes from './routes/adminRoutes'; // <-- This was the missing line

// Load environment variables from .env file
dotenv.config();

// Connect to our MongoDB database
connectDB();

const app: Express = express();

// Enable CORS (Cross-Origin Resource Sharing)
app.use(cors({
  origin: "http://localhost:8080", // frontend URL
  credentials: true,              // allow cookies/auth headers if needed
}));

// This allows our server to accept JSON data in request bodies
app.use(express.json());

// --- Use Routes ---
// This tells the server which router to use for which URL prefix
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/admin', adminRoutes);

// A simple test route to make sure the server is working
app.get('/', (req: Request, res: Response) => {
  res.send('Medisync API is running...');
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));