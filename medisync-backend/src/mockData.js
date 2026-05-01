const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');

// Mock data with pre-hashed passwords
const mockUsers = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'user@test.com',
    password: '$2a$10$rN8qZJZqZJZqZJZqZJZqZeK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', // password: user123
    role: 'user'
  },
  {
    _id: '2',
    name: 'Admin User',
    email: 'admin@test.com',
    password: '$2a$10$rN8qZJZqZJZqZJZqZJZqZeK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', // password: admin123
    role: 'admin'
  }
];

const mockPharmacies = [
  {
    _id: '101',
    pharmacyName: 'Apollo Pharmacy',
    email: 'apollo@test.com',
    password: '$2a$10$rN8qZJZqZJZqZJZqZJZqZeK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', // password: pharmacy123
    address: '123 Main Street, Mumbai',
    contactNumber: '9876543210',
    location: { type: 'Point', coordinates: [72.8777, 19.0760] },
    isApproved: true,
    rating: 4.5,
    numReviews: 100
  },
  {
    _id: '102',
    pharmacyName: 'MedPlus',
    email: 'medplus@test.com',
    password: '$2a$10$rN8qZJZqZJZqZJZqZJZqZeK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', // password: pharmacy123
    address: '456 Park Road, Delhi',
    contactNumber: '9876543211',
    location: { type: 'Point', coordinates: [77.2090, 28.6139] },
    isApproved: true,
    rating: 4.2,
    numReviews: 85
  }
];

async function seedMockData() {
  try {
    // Hash passwords properly
    const salt = await bcrypt.genSalt(10);
    
    for (let user of mockUsers) {
      user.password = await bcrypt.hash(user.email.includes('admin') ? 'admin123' : 'user123', salt);
      const newUser = new User(user);
      await newUser.save();
    }
    
    for (let pharmacy of mockPharmacies) {
      pharmacy.password = await bcrypt.hash('pharmacy123', salt);
      const newPharmacy = new Pharmacy(pharmacy);
      await newPharmacy.save();
    }
    
    console.log('✅ Mock data seeded successfully');
  } catch (err) {
    console.error('Error seeding mock data:', err);
  }
}

module.exports = { seedMockData, mockUsers, mockPharmacies };
