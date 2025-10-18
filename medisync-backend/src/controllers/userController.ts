// src/controllers/userController.ts

import { Request, Response } from 'express';
import Inventory from '../models/Inventory';
import Medicine from '../models/Medicine';
import User from '../models/User';
import Pharmacy from '../models/Pharmacy';
import Prescription from '../models/Prescription';
import { AuthRequest } from '../middleware/authMiddleware';

// --- Public Function for Searching Medicines ---
export const searchMedicine = async (req: Request, res: Response) => {
  try {
    const { name, lat, lng } = req.query as { name: string; lat: string; lng: string };
    
    if (!name) {
      return res.status(400).json({ msg: 'Medicine name is required' });
    }

    const latitude = lat ? parseFloat(lat) : 19.0760;
    const longitude = lng ? parseFloat(lng) : 72.8777;
    const maxDistance = 50000;

    const results = await Pharmacy.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [longitude, latitude] },
          distanceField: 'distance',
          maxDistance: maxDistance,
          query: { isApproved: true },
          spherical: true
        }
      },
      { $lookup: { from: 'inventories', localField: '_id', foreignField: 'pharmacy', as: 'inventory' }},
      { $unwind: '$inventory' },
      { $lookup: { from: 'medicines', localField: 'inventory.medicine', foreignField: '_id', as: 'medicineDetails' }},
      { $unwind: '$medicineDetails' },
      {
        $match: {
          'medicineDetails.name': { $regex: name, $options: 'i' }
        }
      },
      {
        $project: {
            _id: 0,
            distance: '$distance',
            price: '$inventory.price',
            quantity: '$inventory.quantity',
            medicine: { name: '$medicineDetails.name', manufacturer: '$medicineDetails.manufacturer' },
            pharmacy: {
                id: '$_id',
                name: '$pharmacyName',
                address: '$address',
                location: '$location.coordinates',
                rating: '$rating',
                numReviews: '$numReviews',
                contactNumber: '$contactNumber'
            }
        }
      },
      { $sort: { distance: 1 } }
    ]);

    res.json(results);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// --- Protected Function for Getting a User's Own Profile ---
export const getUserProfile = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ msg: 'Not authorized, not a valid user token.' });
        }
        const user = await User.findById(req.user.id);
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

// --- Protected Function for Uploading a Prescription ---
export const uploadPrescription = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'Please upload an image file.' });
        }

        if (!req.user || !req.user.id) {
            return res.status(401).json({ msg: 'Not authorized.' });
        }

        // In a real app, this would upload to cloud storage. We are simulating that.
        const imageUrl = `https://medisync.s3.amazonaws.com/prescriptions/${req.user.id}-${Date.now()}-${req.file.originalname}`;

        const prescription = await Prescription.create({
            user: req.user.id,
            imageUrl: imageUrl,
            status: 'Pending',
        });

        res.status(201).json(prescription);

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

export const getMedicineSuggestions = async (req: Request, res: Response) => {
  try {
    const { q } = req.query as { q: string };
    
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const suggestions = await Medicine.find({
      name: { $regex: q, $options: 'i' }
    })
    .select('name manufacturer')
    .limit(10);

    res.json(suggestions);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send('Server Error');
  }
};