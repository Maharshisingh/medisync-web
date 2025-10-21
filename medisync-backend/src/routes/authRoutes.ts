// src/routes/authRoutes.ts
import express from 'express';
const router = express.Router();

// Import all functions from the controller
import { 
    registerUser, 
    loginUser,
    registerPharmacy,
    loginPharmacy,
    forgotPassword,
    resetPassword,
    forgotPasswordPharmacy,
    resetPasswordPharmacy
} from '../controllers/authController';

// User Routes
router.post('/register/user', registerUser);
router.post('/login/user', loginUser);
router.post('/forgot-password/user', forgotPassword);
router.post('/reset-password/user', resetPassword);

// Pharmacy Routes
router.post('/register/pharmacy', registerPharmacy);
router.post('/login/pharmacy', loginPharmacy);
router.post('/forgot-password/pharmacy', forgotPasswordPharmacy);
router.post('/reset-password/pharmacy', resetPasswordPharmacy);

export default router;