// src/routes/authRoutes.ts
import express from 'express';
const router = express.Router();

// Import all four functions from the controller
import { 
    registerUser, 
    loginUser,
    registerPharmacy,
    loginPharmacy // <-- Add this import
} from '../controllers/authController';

// User Routes
router.post('/register/user', registerUser);
router.post('/login/user', loginUser);

// Pharmacy Routes
router.post('/register/pharmacy', registerPharmacy);
router.post('/login/pharmacy', loginPharmacy); // <-- Add this line

export default router;