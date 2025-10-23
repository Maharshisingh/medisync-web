// src/routes/adminRoutes.js
const express = require('express');
const { getPendingPharmacies, approvePharmacy, rejectPharmacy } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/pharmacies/pending', protect, admin, getPendingPharmacies);
router.put('/pharmacies/approve/:id', protect, admin, approvePharmacy);
router.delete('/pharmacies/reject/:id', protect, admin, rejectPharmacy);

module.exports = router;