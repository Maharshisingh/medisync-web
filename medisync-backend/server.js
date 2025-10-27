// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');

// Import all of our route files
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const pharmacyRoutes = require('./src/routes/pharmacyRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// Load environment variables from .env file
dotenv.config();

// Connect to our MongoDB database
connectDB();

const app = express();


const allowedOrigins = [
  "http://localhost:8080",
  "https://medisync-js-zt23.vercel.app",
  process.env.FRONTEND_URL, // in case you have another one set in env
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
// This allows our server to accept JSON data in request bodies
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MediSync API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// --- Use Routes ---
// This tells the server which router to use for which URL prefix
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../medisync-frontend/dist')));
} else {
  app.get('/', (req, res) => {
    res.send('Medisync API is running...');
  });
}

// Handle React routing - this must be LAST
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../medisync-frontend/dist/index.html'));
  });
}

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));