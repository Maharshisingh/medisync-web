// src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Pharmacy from '../models/Pharmacy';
import { IUser } from '../models/User'; // Import the IUser interface

// --- USER AUTHENTICATION ---
export const registerUser = async (req: Request, res: Response) => {
  // ... (This function is already correct) ...
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    user = new User({ name, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };
    jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token });
      }
    );
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send('Server error');
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password role');
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;

        // 👇 Log the email after successful login
        console.log(`✅ User logged in: ${user.email}`);

        res.json({ token, email: user.email });
      }
    );
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send('Server error');
  }
};


// --- PHARMACY AUTHENTICATION ---
export const registerPharmacy = async (req: Request, res: Response) => {
  // ... (This function is already correct) ...
  const { pharmacyName, email, password, address, contactNumber, coordinates } = req.body;
  try {
    let pharmacy = await Pharmacy.findOne({ email });
    if (pharmacy) {
      return res.status(400).json({ msg: 'Pharmacy with this email already exists' });
    }
    pharmacy = new Pharmacy({
      pharmacyName, email, password, address, contactNumber,
      location: {
        type: 'Point',
        coordinates: [coordinates.lng, coordinates.lat]
      }
    });
    const salt = await bcrypt.genSalt(10);
    pharmacy.password = await bcrypt.hash(password, salt);
    await pharmacy.save();
    res.status(201).json({ msg: 'Registration successful. Your account is pending admin approval.' });
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send('Server error');
  }
};


export const loginPharmacy = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const pharmacy = await Pharmacy.findOne({ email }).select('+password');
    if (!pharmacy) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }
    if (!pharmacy.isApproved) {
      return res.status(403).json({ msg: 'Your account has not been approved yet.' });
    }
    const isMatch = await bcrypt.compare(password, pharmacy.password!);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      pharmacy: {
        id: pharmacy.id,
        role: 'pharmacy',
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;

        // 👇 Log the email after successful login
        console.log(`✅ Pharmacy logged in: ${pharmacy.email}`);

        res.json({ token, email: pharmacy.email });
      }
    );
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send('Server error');
  }
};
