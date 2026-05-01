// Mock database connection for development without MongoDB
const connectDB = async () => {
  console.log('⚠️  Running in MOCK MODE - No MongoDB connection');
  console.log('✅ Mock Database Ready');
};

module.exports = connectDB;
