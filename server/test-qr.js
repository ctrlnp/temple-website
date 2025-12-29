require('dotenv').config();
const mongoose = require('mongoose');
const QRCode = require('./src/models/QRCode');
const jwt = require('jsonwebtoken');

// Test QR code creation
async function testQRCreate() {
  try {
    console.log('🧪 Testing QR Code Creation...');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      family: 4,
    });

    console.log('✅ Database connected');

    // Create a test user ID (simulate admin user)
    const testUserId = new mongoose.Types.ObjectId();

    // Test data
    const testData = {
      title: 'Test QR Code',
      description: 'This is a test QR code for debugging',
      qrImageUrl: '/images/default-qr.png',
      eventName: 'Test Event',
      amount: '₹100',
      createdBy: testUserId
    };

    console.log('📝 Test data:', testData);

    // Try to create QR code
    const qrCode = await QRCode.create(testData);
    console.log('✅ QR Code created successfully:', qrCode._id);
    console.log('📄 Created QR:', {
      id: qrCode._id,
      title: qrCode.title,
      eventName: qrCode.eventName,
      isActive: qrCode.isActive
    });

    // Test fetching active QR
    const activeQR = await QRCode.findOne({ isActive: true });
    console.log('📱 Active QR found:', activeQR ? activeQR.title : 'None');

    await mongoose.disconnect();
    console.log('✅ QR Code test completed successfully');

  } catch (error) {
    console.error('❌ QR Code test failed:', error.message);
    console.error('Full error:', error);
  }
}

testQRCreate();
