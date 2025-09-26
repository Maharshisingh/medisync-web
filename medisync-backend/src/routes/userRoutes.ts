// src/routes/userRoutes.ts
import express from 'express';
const router = express.Router();

// Import controllers
import { searchMedicine, getUserProfile, uploadPrescription } from '../controllers/userController';

// Import middleware
import { protect } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware'; // <-- Import the new upload middleware

// Public route
router.get('/search', searchMedicine);

// Protected User routes
router.get('/profile', protect, getUserProfile);

// New route for uploading prescriptions
router.post(
    '/prescriptions/upload',
    protect, // 1. Check if user is logged in
    upload.single('prescription'), // 2. Handle the 'prescription' file
    uploadPrescription // 3. Run our controller logic
);

export default router;