// src/routes/adminRoutes.ts
import express from 'express';
import { getPendingPharmacies, approvePharmacy } from '../controllers/adminController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Route to get all pharmacies that are not yet approved
router.get('/pharmacies/pending', protect, admin, getPendingPharmacies);

// Route to approve a specific pharmacy by its ID
router.put('/pharmacies/approve/:id', protect, admin, approvePharmacy);

export default router;