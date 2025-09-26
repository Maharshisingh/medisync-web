// src/routes/pharmacyRoutes.ts
import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware';
import { 
    uploadInventory, 
    createPharmacyReview,
    getPharmacyReviews,
    getMyInventory 
} from '../controllers/pharmacyController';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Route for a pharmacy to upload inventory
router.post(
  '/inventory/upload',
  protect,
  upload.single('inventoryFile'),
  uploadInventory
);

// Route for a user to create a review
router.post('/:id/reviews', protect, createPharmacyReview);

// Route for anyone to get the reviews for a pharmacy
router.get('/:id/reviews', getPharmacyReviews); 

router.get('/inventory/me', protect, getMyInventory);
export default router;