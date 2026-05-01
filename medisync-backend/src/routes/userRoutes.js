// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();

const { searchMedicine, getUserProfile, updateUserProfile, uploadPrescription, getMedicineSuggestions } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/search', searchMedicine);
router.get('/suggestions', getMedicineSuggestions);

// Protected User routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

router.post(
    '/prescriptions/upload',
    protect,
    upload.single('prescription'),
    uploadPrescription
);

module.exports = router;