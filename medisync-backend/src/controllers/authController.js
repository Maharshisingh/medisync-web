// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');

const registerUser = async (req, res) => {
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
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  console.log(`🔍 User login attempt: ${email}`);
  
  // Validate input
  if (!email || !password) {
    return res.status(400).json({ msg: 'Please provide email and password' });
  }
  
  try {
    const user = await User.findOne({ email }).select('+password role');
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }
    
    console.log(`📋 User found: ${user.name}, Role: ${user.role}`);
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`🔐 Password match: ${isMatch}`);
    
    if (!isMatch) {
      console.log(`❌ Invalid password for: ${email}`);
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
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) {
          console.error('JWT signing error:', err);
          return res.status(500).json({ msg: 'Token generation failed' });
        }
        console.log(`✅ User logged in: ${user.email}`);
        res.json({ token, email: user.email });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

const registerPharmacy = async (req, res) => {
  const { pharmacyName, email, password, address, contactNumber, location } = req.body;
  try {
    let pharmacy = await Pharmacy.findOne({ email });
    if (pharmacy) {
      return res.status(400).json({ msg: 'Pharmacy with this email already exists' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Ensure location has proper structure
    const pharmacyLocation = location || {
      type: 'Point',
      coordinates: [72.8777, 19.0760] // Default Mumbai coordinates
    };
    
    pharmacy = new Pharmacy({
      pharmacyName, 
      email, 
      password: hashedPassword, 
      address, 
      contactNumber,
      location: pharmacyLocation,
      isApproved: false
    });
    
    await pharmacy.save();
    res.status(201).json({ msg: 'Registration submitted successfully. Please wait for admin approval.' });
  } catch (err) {
    console.error('Pharmacy registration error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

const loginPharmacy = async (req, res) => {
  const { email, password } = req.body;
  
  console.log(`🔍 Pharmacy login attempt: ${email}`);
  
  try {
    const pharmacy = await Pharmacy.findOne({ email }).select('+password isApproved');
    
    if (!pharmacy) {
      console.log(`❌ Pharmacy not found: ${email}`);
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }
    
    console.log(`📋 Pharmacy found: ${pharmacy.pharmacyName}, Approved: ${pharmacy.isApproved}`);
    
    if (!pharmacy.isApproved) {
      console.log(`⏳ Pharmacy not approved: ${email}`);
      return res.status(403).json({ msg: 'Your account has not been approved yet.' });
    }
    
    const isMatch = await bcrypt.compare(password, pharmacy.password);
    console.log(`🔐 Password match: ${isMatch}`);
    
    if (!isMatch) {
      console.log(`❌ Invalid password for: ${email}`);
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
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) {
          console.error('JWT signing error:', err);
          return res.status(500).json({ msg: 'Token generation failed' });
        }
        console.log(`✅ Pharmacy logged in: ${pharmacy.email}`);
        res.json({ token, email: pharmacy.email });
      }
    );
  } catch (err) {
    console.error('Pharmacy login error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    res.json({ msg: 'Password reset token generated', resetToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const resetPassword = async (req, res) => {
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
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const forgotPasswordPharmacy = async (req, res) => {
  const { email } = req.body;
  try {
    const pharmacy = await Pharmacy.findOne({ email });
    if (!pharmacy) {
      return res.status(404).json({ msg: 'Pharmacy not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

    pharmacy.resetPasswordToken = resetToken;
    pharmacy.resetPasswordExpires = resetTokenExpiry;
    await pharmacy.save();

    res.json({ msg: 'Password reset token generated', resetToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const resetPasswordPharmacy = async (req, res) => {
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
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  registerUser,
  loginUser,
  registerPharmacy,
  loginPharmacy,
  forgotPassword,
  resetPassword,
  forgotPasswordPharmacy,
  resetPasswordPharmacy
};