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

// ----- CORS Configuration -----
const allowedOrigins = [
  "http://localhost:8080",
  "https://medisync-js-zt23.vercel.app",
  process.env.FRONTEND_URL, // optional extra
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn(`Blocked CORS request from origin: ${origin}`);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Allows our server to accept JSON data in request bodies
app.use(express.json());

// ----- Health Check Endpoint -----
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'MediSync API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ----- API Routes -----
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/admin', adminRoutes);

// ----- Serve Frontend (Production Only) -----
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React build
  app.use(express.static(path.join(__dirname, '../medisync-frontend/dist')));

  // Handle React routing (must come after static middleware)
  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../medisync-frontend/dist/index.html'));
  });
} else {
  // Dev mode root endpoint
  app.get('/', (req, res) => {
    res.send('MediSync API is running...');
  });
}

// ----- 404 Fallback for unknown API routes -----
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ----- Start the Server -----
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
