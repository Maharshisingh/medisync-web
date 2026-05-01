const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Pharmacy = require('./src/models/Pharmacy');
const Medicine = require('./src/models/Medicine');
const Inventory = require('./src/models/Inventory');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Clear existing data
    await User.deleteMany({});
    await Pharmacy.deleteMany({});
    await Medicine.deleteMany({});
    await Inventory.deleteMany({});

    const salt = await bcrypt.genSalt(10);

    // Create Users
    const users = [
      {
        name: 'John Doe',
        email: 'user@test.com',
        password: await bcrypt.hash('user123', salt),
        role: 'user'
      },
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: await bcrypt.hash('admin123', salt),
        role: 'admin'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@test.com',
        password: await bcrypt.hash('user123', salt),
        role: 'user'
      },
      {
        name: 'Mike Wilson',
        email: 'mike@test.com',
        password: await bcrypt.hash('user123', salt),
        role: 'user'
      },
      {
        name: 'Emily Brown',
        email: 'emily@test.com',
        password: await bcrypt.hash('user123', salt),
        role: 'user'
      }
    ];

    await User.insertMany(users);
    console.log('✅ Users created');

    // Create Pharmacies
    const pharmacies = [
      {
        pharmacyName: 'Apollo Pharmacy',
        email: 'apollo@test.com',
        password: await bcrypt.hash('pharmacy123', salt),
        address: '123 Main Street, Mumbai',
        contactNumber: '9876543210',
        location: { type: 'Point', coordinates: [72.8777, 19.0760] },
        isApproved: true,
        rating: 4.5,
        numReviews: 100
      },
      {
        pharmacyName: 'MedPlus Pharmacy',
        email: 'medplus@test.com',
        password: await bcrypt.hash('pharmacy123', salt),
        address: '456 Park Road, Delhi',
        contactNumber: '9876543211',
        location: { type: 'Point', coordinates: [77.2090, 28.6139] },
        isApproved: true,
        rating: 4.2,
        numReviews: 85
      },
      {
        pharmacyName: 'HealthCare Pharmacy',
        email: 'healthcare@test.com',
        password: await bcrypt.hash('pharmacy123', salt),
        address: '789 Lake View, Bangalore',
        contactNumber: '9876543212',
        location: { type: 'Point', coordinates: [77.5946, 12.9716] },
        isApproved: true,
        rating: 4.7,
        numReviews: 120
      }
    ];

    const createdPharmacies = await Pharmacy.insertMany(pharmacies);
    console.log('✅ Pharmacies created');

    // Create Medicines
    const medicines = [
      { name: 'Paracetamol 500mg', manufacturer: 'Cipla', composition: ['Paracetamol'] },
      { name: 'Amoxicillin 250mg', manufacturer: 'Sun Pharma', composition: ['Amoxicillin'] },
      { name: 'Ibuprofen 400mg', manufacturer: 'Dr. Reddy\'s', composition: ['Ibuprofen'] },
      { name: 'Cetirizine 10mg', manufacturer: 'Cipla', composition: ['Cetirizine'] },
      { name: 'Azithromycin 500mg', manufacturer: 'Lupin', composition: ['Azithromycin'] },
      { name: 'Omeprazole 20mg', manufacturer: 'Sun Pharma', composition: ['Omeprazole'] },
      { name: 'Metformin 500mg', manufacturer: 'USV', composition: ['Metformin'] },
      { name: 'Atorvastatin 10mg', manufacturer: 'Ranbaxy', composition: ['Atorvastatin'] },
      { name: 'Aspirin 75mg', manufacturer: 'Bayer', composition: ['Aspirin'] },
      { name: 'Vitamin D3 60000 IU', manufacturer: 'Mankind', composition: ['Cholecalciferol'] },
      { name: 'Cough Syrup', manufacturer: 'Dabur', composition: ['Dextromethorphan'] },
      { name: 'Pantoprazole 40mg', manufacturer: 'Alkem', composition: ['Pantoprazole'] },
      { name: 'Dolo 650', manufacturer: 'Micro Labs', composition: ['Paracetamol'] },
      { name: 'Crocin Advance', manufacturer: 'GSK', composition: ['Paracetamol'] },
      { name: 'Combiflam', manufacturer: 'Sanofi', composition: ['Ibuprofen', 'Paracetamol'] },
      { name: 'Allegra 120mg', manufacturer: 'Sanofi', composition: ['Fexofenadine'] },
      { name: 'Sinarest', manufacturer: 'Centaur', composition: ['Paracetamol', 'Chlorpheniramine'] },
      { name: 'Vicks Vaporub', manufacturer: 'P&G', composition: ['Menthol', 'Camphor'] },
      { name: 'Digene Gel', manufacturer: 'Abbott', composition: ['Magnesium Hydroxide'] },
      { name: 'Electral Powder', manufacturer: 'FDC', composition: ['Sodium Chloride', 'Potassium'] }
    ];

    const createdMedicines = await Medicine.insertMany(medicines);
    console.log('✅ Medicines created');

    // Create Inventory for each pharmacy
    const inventoryItems = [];
    
    createdPharmacies.forEach((pharmacy, pIndex) => {
      // Each pharmacy gets 12-18 random medicines
      const numMedicines = 12 + Math.floor(Math.random() * 7);
      const selectedMedicines = [...createdMedicines]
        .sort(() => 0.5 - Math.random())
        .slice(0, numMedicines);
      
      selectedMedicines.forEach(medicine => {
        inventoryItems.push({
          pharmacy: pharmacy._id,
          medicine: medicine._id,
          price: Math.floor(Math.random() * 400) + 50, // Price between 50-450
          quantity: Math.floor(Math.random() * 200) + 20, // Quantity between 20-220
          inStock: Math.random() > 0.1 // 90% in stock
        });
      });
    });

    await Inventory.insertMany(inventoryItems);
    console.log('✅ Inventory created');

    console.log('\n📋 Login Credentials:\n');
    console.log('USER LOGINS:');
    console.log('Email: user@test.com | Password: user123');
    console.log('Email: sarah@test.com | Password: user123');
    console.log('Email: mike@test.com | Password: user123');
    console.log('Email: emily@test.com | Password: user123\n');
    console.log('ADMIN LOGIN:');
    console.log('Email: admin@test.com | Password: admin123\n');
    console.log('PHARMACY LOGINS:');
    console.log('Email: apollo@test.com | Password: pharmacy123');
    console.log('Email: medplus@test.com | Password: pharmacy123');
    console.log('Email: healthcare@test.com | Password: pharmacy123\n');

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

seedData();
