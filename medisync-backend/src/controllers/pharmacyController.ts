// src/controllers/pharmacyController.ts
import { Request, Response } from 'express'; // Make sure Request is imported
import xlsx from 'xlsx';
import { AuthRequest } from '../middleware/authMiddleware';
import Medicine from '../models/Medicine';
import Inventory from '../models/Inventory';
import Pharmacy from '../models/Pharmacy';
import Review from '../models/Review';

export const uploadInventory = async (req: AuthRequest, res: Response) => {
  // ... existing uploadInventory code ...
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded.' });
    }
    if (!req.pharmacy || !req.pharmacy.id) {
        return res.status(401).json({ msg: 'Not authorized, not a valid pharmacy token.' });
    }
    const pharmacyId = req.pharmacy.id;
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: any[] = xlsx.utils.sheet_to_json(worksheet);
    for (const row of data) {
      if (!row.MedicineName || row.Price == null || row.Quantity == null) {
        continue;
      }
      let medicine = await Medicine.findOne({ name: row.MedicineName });
      if (!medicine) {
        medicine = await Medicine.create({
          name: row.MedicineName,
          manufacturer: row.Manufacturer || 'N/A',
        });
      }
      await Inventory.findOneAndUpdate(
        { pharmacy: pharmacyId, medicine: medicine._id },
        {
          price: Number(row.Price),
          quantity: Number(row.Quantity),
          inStock: Number(row.Quantity) > 0,
        },
        { upsert: true }
      );
    }
    res.status(200).json({ msg: 'Inventory updated successfully from file.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server Error while processing file.' });
  }
};

export const createPharmacyReview = async (req: AuthRequest, res: Response) => {
  // ... existing createPharmacyReview code ...
  const { rating, comment } = req.body;
  const pharmacyId = req.params.id;
  try {
      if (!req.user || !req.user.id) {
          return res.status(401).json({ msg: 'Not authorized. Only users can leave reviews.' });
      }
      const userId = req.user.id;
      const pharmacy = await Pharmacy.findById(pharmacyId);
      if (!pharmacy) {
          return res.status(404).json({ msg: 'Pharmacy not found' });
      }
      const alreadyReviewed = await Review.findOne({ user: userId, pharmacy: pharmacyId });
      if (alreadyReviewed) {
          return res.status(400).json({ msg: 'You have already reviewed this pharmacy' });
      }
      const review = new Review({
          user: userId,
          pharmacy: pharmacyId,
          rating: Number(rating),
          comment,
      });
      await review.save();
      const reviews = await Review.find({ pharmacy: pharmacyId });
      pharmacy.numReviews = reviews.length;
      pharmacy.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
      await pharmacy.save();
      res.status(201).json({ msg: 'Review added successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server Error' });
  }
};

// --- ADD THIS NEW FUNCTION AT THE END ---
export const getPharmacyReviews = async (req: Request, res: Response) => {
    try {
        const pharmacyId = req.params.id;

        // Find all reviews that match the pharmacy's ID
        const reviews = await Review.find({ pharmacy: pharmacyId })
            // Also fetch the name of the user who wrote the review
            .populate('user', 'name'); 

        res.json(reviews);

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
};
// Add this to the end of src/controllers/pharmacyController.ts

export const getMyInventory = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.pharmacy || !req.pharmacy.id) {
            return res.status(401).json({ msg: 'Not authorized, not a valid pharmacy token.' });
        }

        const inventory = await Inventory.find({ pharmacy: req.pharmacy.id })
            .populate('medicine', 'name manufacturer');

        res.json(inventory);

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

export const addMedicineToInventory = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.pharmacy || !req.pharmacy.id) {
            return res.status(401).json({ msg: 'Not authorized, not a valid pharmacy token.' });
        }

        const { name, manufacturer, price, quantity } = req.body;
        
        if (!name || price == null || quantity == null) {
            return res.status(400).json({ msg: 'Name, price, and quantity are required.' });
        }

        const pharmacyId = req.pharmacy.id;

        // Find or create the medicine
        let medicine = await Medicine.findOne({ name });
        if (!medicine) {
            medicine = await Medicine.create({
                name,
                manufacturer: manufacturer || 'N/A',
            });
        }

        // Add or update inventory
        const inventoryItem = await Inventory.findOneAndUpdate(
            { pharmacy: pharmacyId, medicine: medicine._id },
            {
                price: Number(price),
                quantity: Number(quantity),
                inStock: Number(quantity) > 0,
            },
            { upsert: true, new: true }
        ).populate('medicine', 'name manufacturer');

        res.status(201).json({ msg: 'Medicine added successfully', inventoryItem });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

export const getPharmacyProfile = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.pharmacy || !req.pharmacy.id) {
            return res.status(401).json({ msg: 'Not authorized, not a valid pharmacy token.' });
        }

        const pharmacy = await Pharmacy.findById(req.pharmacy.id).select('-password');
        
        if (!pharmacy) {
            return res.status(404).json({ msg: 'Pharmacy not found' });
        }

        res.json(pharmacy);

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

export const updateInventoryItem = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.pharmacy || !req.pharmacy.id) {
            return res.status(401).json({ msg: 'Not authorized, not a valid pharmacy token.' });
        }

        const { price, quantity } = req.body;
        const inventoryId = req.params.id;
        
        if (price == null || quantity == null) {
            return res.status(400).json({ msg: 'Price and quantity are required.' });
        }

        const inventoryItem = await Inventory.findOneAndUpdate(
            { _id: inventoryId, pharmacy: req.pharmacy.id },
            {
                price: Number(price),
                quantity: Number(quantity),
                inStock: Number(quantity) > 0,
            },
            { new: true }
        ).populate('medicine', 'name manufacturer');

        if (!inventoryItem) {
            return res.status(404).json({ msg: 'Inventory item not found' });
        }

        res.json({ msg: 'Inventory item updated successfully', inventoryItem });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

export const deleteInventoryItem = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.pharmacy || !req.pharmacy.id) {
            return res.status(401).json({ msg: 'Not authorized, not a valid pharmacy token.' });
        }

        const inventoryId = req.params.id;

        const inventoryItem = await Inventory.findOneAndDelete({
            _id: inventoryId,
            pharmacy: req.pharmacy.id
        });

        if (!inventoryItem) {
            return res.status(404).json({ msg: 'Inventory item not found' });
        }

        res.json({ msg: 'Inventory item deleted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

export const updatePharmacyProfile = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.pharmacy || !req.pharmacy.id) {
            return res.status(401).json({ msg: 'Not authorized, not a valid pharmacy token.' });
        }

        const { pharmacyName, contactNumber, address } = req.body;
        
        const updatedPharmacy = await Pharmacy.findByIdAndUpdate(
            req.pharmacy.id,
            {
                pharmacyName,
                contactNumber,
                address
            },
            { new: true }
        ).select('-password');

        if (!updatedPharmacy) {
            return res.status(404).json({ msg: 'Pharmacy not found' });
        }

        res.json({ msg: 'Profile updated successfully', pharmacy: updatedPharmacy });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
};
