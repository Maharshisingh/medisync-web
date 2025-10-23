// src/controllers/adminController.js
const Pharmacy = require('../models/Pharmacy');

const getPendingPharmacies = async (req, res) => {
  try {
    const pendingPharmacies = await Pharmacy.find({ isApproved: false });
    res.json(pendingPharmacies);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

const approvePharmacy = async (req, res) => {
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
        console.error(error.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

const rejectPharmacy = async (req, res) => {
    try {
        const pharmacy = await Pharmacy.findByIdAndDelete(req.params.id);
        
        if (!pharmacy) {
            return res.status(404).json({ msg: 'Pharmacy not found' });
        }
        
        res.json({ msg: 'Pharmacy application rejected and removed' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

module.exports = {
    getPendingPharmacies,
    approvePharmacy,
    rejectPharmacy
};