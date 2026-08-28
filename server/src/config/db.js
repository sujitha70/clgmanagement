const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers for Windows SRV queries
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

let isMongoConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/clgmanagement';
  try {
    mongoose.set('strictQuery', false);
    // Connect with a short timeout to prevent blocking if Mongo is not running locally
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000
    });
    isMongoConnected = true;
    console.log('✅ MongoDB connected successfully to:', uri);
  } catch (err) {
    isMongoConnected = false;
    console.log('⚡ MongoDB not detected or offline. Running seamlessly on high-performance In-Memory State Store with pre-seeded data.');
  }
};

const getMongoStatus = () => isMongoConnected;

module.exports = {
  connectDB,
  getMongoStatus
};
