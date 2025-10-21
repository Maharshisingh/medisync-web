// src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
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
  const { pharmacyName, email, password, address, contactNumber, location } = req.body;
  try {
    let pharmacy = await Pharmacy.findOne({ email });
    if (pharmacy) {
      return res.status(400).json({ msg: 'Pharmacy with this email already exists' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    pharmacy = new Pharmacy({
      pharmacyName, 
      email, 
      password: hashedPassword, 
      address, 
      contactNumber,
      location,
      isApproved: false
    });
    
    await pharmacy.save();
    res.status(201).json({ msg: 'Registration submitted successfully. Please wait for admin approval.' });
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

// --- FORGOT PASSWORD ---
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    res.json({ msg: 'Password reset token generated', resetToken });
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send('Server error');
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ msg: 'Password reset successful' });
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send('Server error');
  }
};

export const forgotPasswordPharmacy = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const pharmacy = await Pharmacy.findOne({ email });
    if (!pharmacy) {
      return res.status(404).json({ msg: 'Pharmacy not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    pharmacy.resetPasswordToken = resetToken;
    pharmacy.resetPasswordExpires = resetTokenExpiry;
    await pharmacy.save();

    res.json({ msg: 'Password reset token generated', resetToken });
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send('Server error');
  }
};

export const resetPasswordPharmacy = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  try {
    const pharmacy = await Pharmacy.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!pharmacy) {
      return res.status(400).json({ msg: 'Invalid or expired reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    pharmacy.password = await bcrypt.hash(newPassword, salt);
    pharmacy.resetPasswordToken = undefined;
    pharmacy.resetPasswordExpires = undefined;
    await pharmacy.save();

    res.json({ msg: 'Password reset successful' });
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send('Server error');
  }
};
