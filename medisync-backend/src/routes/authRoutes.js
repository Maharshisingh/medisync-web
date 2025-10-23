// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();

const { 
    registerUser, 
    loginUser,
    registerPharmacy,
    loginPharmacy,
    forgotPassword,
    resetPassword,
    forgotPasswordPharmacy,
    resetPasswordPharmacy
} = require('../controllers/authController');

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

module.exports = router;