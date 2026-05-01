// src/routes/pharmacyRoutes.js
const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { 
    uploadInventory, 
    createPharmacyReview,
    getPharmacyReviews,
    getMyInventory,
    addMedicineToInventory,
    getPharmacyProfile,
    updateInventoryItem,
    deleteInventoryItem,
    updatePharmacyProfile,
    searchMedicines,
    getPharmacyById,
    getPharmacyInventory
} = require('../controllers/pharmacyController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/inventory/upload',
  protect,
  upload.single('inventoryFile'),
  uploadInventory
);

router.post('/:id/reviews', protect, createPharmacyReview);
router.get('/:id/reviews', getPharmacyReviews); 
router.get('/inventory/me', protect, getMyInventory);
router.post('/inventory/add', protect, addMedicineToInventory);
router.put('/inventory/update/:id', protect, updateInventoryItem);
router.delete('/inventory/delete/:id', protect, deleteInventoryItem);
router.get('/profile', protect, getPharmacyProfile);
router.put('/profile/update', protect, updatePharmacyProfile);
router.get('/search', searchMedicines);
router.get('/:id', getPharmacyById);
router.get('/:id/inventory', getPharmacyInventory);

module.exports = router;