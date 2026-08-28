require('dotenv').config();
const dns = require('dns');
const mongoose = require('mongoose');

// Use reliable public DNS resolvers to handle SRV records on Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

async function testConnection() {
  console.log('Testing MongoDB connection with URI:', process.env.MONGODB_URI?.replace(/:([^@]+)@/, ':****@'));
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000
    });
    console.log('✅ SUCCESS: Connected to MongoDB Atlas cluster!');
    console.log('   Host:', mongoose.connection.host);
    console.log('   Database name:', mongoose.connection.name);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection Failed:', err.message);
    process.exit(1);
  }
}

testConnection();
