// src/controllers/adminController.ts
import { Request, Response } from 'express';
import Pharmacy from '../models/Pharmacy';

// Gets all pharmacies that are not yet approved
export const getPendingPharmacies = async (req: Request, res: Response) => {
  try {
    const pendingPharmacies = await Pharmacy.find({ isApproved: false });
    res.json(pendingPharmacies);
  } catch (error) {
    const err = error as Error;
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Approves a specific pharmacy by its ID
export const approvePharmacy = async (req: Request, res: Response) => {
    try {
        const pharmacy = await Pharmacy.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        );

        if (!pharmacy) {
            return res.status(404).json({ msg: 'Pharmacy not found' });
        }

        res.json({ msg: 'Pharmacy approved successfully', pharmacy });

    } catch (error) {
        const err = error as Error;
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

export const rejectPharmacy = async (req: Request, res: Response) => {
    try {
        const pharmacy = await Pharmacy.findByIdAndDelete(req.params.id);
        
        if (!pharmacy) {
            return res.status(404).json({ msg: 'Pharmacy not found' });
        }
        
        res.json({ msg: 'Pharmacy application rejected and removed' });
    } catch (error) {
        const err = error as Error;
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};