import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Medicine from './models/Medicine';
import Pharmacy from './models/Pharmacy';
import Inventory from './models/Inventory';
import connectDB from './config/db';

dotenv.config();

const sampleMedicines = [
  { name: 'Paracetamol 500mg', manufacturer: 'Cipla' },
  { name: 'Ibuprofen 400mg', manufacturer: 'Sun Pharma' },
  { name: 'Amoxicillin 250mg', manufacturer: 'Lupin' },
  { name: 'Cetirizine 10mg', manufacturer: 'Dr. Reddy\'s' },
  { name: 'Omeprazole 20mg', manufacturer: 'Torrent' },
  { name: 'Metformin 500mg', manufacturer: 'Aurobindo' },
  { name: 'Atorvastatin 10mg', manufacturer: 'Ranbaxy' },
  { name: 'Amlodipine 5mg', manufacturer: 'Cadila' },
  { name: 'Losartan 50mg', manufacturer: 'Glenmark' },
  { name: 'Aspirin 75mg', manufacturer: 'Bayer' },
  { name: 'Vitamin D3 60000 IU', manufacturer: 'Abbott' },
  { name: 'Calcium Carbonate 500mg', manufacturer: 'Mankind' },
  { name: 'Iron Folic Acid', manufacturer: 'Alkem' },
  { name: 'Azithromycin 500mg', manufacturer: 'Pfizer' },
  { name: 'Dolo 650mg', manufacturer: 'Micro Labs' },
  { name: 'Crocin 500mg', manufacturer: 'GSK' },
  { name: 'Combiflam', manufacturer: 'Sanofi' },
  { name: 'Pantoprazole 40mg', manufacturer: 'Alkem' },
  { name: 'Montelukast 10mg', manufacturer: 'Cipla' },
  { name: 'Levothyroxine 50mcg', manufacturer: 'Abbott' }
];

const samplePharmacies = [
  {
    pharmacyName: 'HealthCare Pharmacy',
    email: 'healthcare@pharmacy.com',
    password: 'pharmacy123',
    address: '123 Main Street, Downtown, City - 400001',
    contactNumber: '9876543210',
    location: { type: 'Point', coordinates: [72.8777, 19.0760] },
    isApproved: true
  },
  {
    pharmacyName: 'MediPlus Store',
    email: 'mediplus@pharmacy.com',
    password: 'pharmacy123',
    address: '456 Park Avenue, Central, City - 400002',
    contactNumber: '9876543211',
    location: { type: 'Point', coordinates: [72.8800, 19.0800] },
    isApproved: true
  },
  {
    pharmacyName: 'WellCare Pharmacy',
    email: 'wellcare@pharmacy.com',
    password: 'pharmacy123',
    address: '789 Health Street, Medical District, City - 400003',
    contactNumber: '9876543212',
    location: { type: 'Point', coordinates: [72.8750, 19.0720] },
    isApproved: true
  },
  {
    pharmacyName: 'QuickMed Pharmacy',
    email: 'quickmed@pharmacy.com',
    password: 'pharmacy123',
    address: '321 Express Lane, Business District, City - 400004',
    contactNumber: '9876543213',
    location: { type: 'Point', coordinates: [72.8820, 19.0780] },
    isApproved: true
  },
  {
    pharmacyName: 'CityMed Pharmacy',
    email: 'citymed@pharmacy.com',
    password: 'pharmacy123',
    address: '654 Urban Road, City Center, City - 400005',
    contactNumber: '9876543214',
    location: { type: 'Point', coordinates: [72.8770, 19.0740] },
    isApproved: true
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Medicine.deleteMany({});
    await Pharmacy.deleteMany({});
    await Inventory.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Add medicines
    const medicines = await Medicine.insertMany(sampleMedicines);
    console.log(`Added ${medicines.length} medicines`);
    
    // Add pharmacies
    const pharmacies = [];
    for (const pharmacyData of samplePharmacies) {
      const hashedPassword = await bcrypt.hash(pharmacyData.password, 10);
      const pharmacy = await Pharmacy.create({
        ...pharmacyData,
        password: hashedPassword
      });
      pharmacies.push(pharmacy);
    }
    console.log(`Added ${pharmacies.length} pharmacies`);
    
    // Add inventory for each pharmacy
    for (const pharmacy of pharmacies) {
      const inventoryItems = [];
      
      // Each pharmacy gets 10-15 random medicines
      const numMedicines = Math.floor(Math.random() * 6) + 10;
      const selectedMedicines = medicines.sort(() => 0.5 - Math.random()).slice(0, numMedicines);
      
      for (const medicine of selectedMedicines) {
        inventoryItems.push({
          pharmacy: pharmacy._id,
          medicine: medicine._id,
          price: Math.floor(Math.random() * 500) + 50, // Random price between 50-550
          quantity: Math.floor(Math.random() * 200) + 10, // Random quantity between 10-210
          inStock: true
        });
      }
      
      await Inventory.insertMany(inventoryItems);
      console.log(`Added ${inventoryItems.length} inventory items for ${pharmacy.pharmacyName}`);
    }
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();