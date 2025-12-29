require('dotenv').config();
const mongoose = require('mongoose');

async function testDB() {
  try {
    console.log('🧪 Testing Online MongoDB Connection...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set ✅' : 'Not set ❌');

    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is not set');
      console.log('Please check your .env file in the server directory');
      console.log('For MongoDB Atlas, your URI should look like:');
      console.log('mongodb+srv://username:password@cluster.mongodb.net/database');
      return;
    }

    console.log('🔗 Attempting to connect to MongoDB Atlas...');

    // Use the same connection options as the main app
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Increased timeout for cloud databases
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      family: 4,
    });

    console.log('✅ Database connected successfully');
    console.log('📍 Host:', mongoose.connection.host);
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🔗 Ready State:', mongoose.connection.readyState);

    // Test creating a simple document
    const QRCode = require('./src/models/QRCode');
    console.log('🔍 Testing QRCode model...');

    const testQR = new QRCode({
      title: 'Connection Test',
      description: 'Testing database connection',
      qrImageUrl: '/images/default-qr.png',
      eventName: 'Test Event',
      amount: '₹100',
      createdBy: new mongoose.Types.ObjectId() // Generate a valid ObjectId
    });

    await testQR.validate();
    console.log('✅ QRCode model validation passed');

    await mongoose.disconnect();
    console.log('✅ Database test completed successfully');
    console.log('');
    console.log('🎉 Your online MongoDB connection is working!');
    console.log('If QR code creation still fails, check:');
    console.log('  1. Browser console for client-side errors');
    console.log('  2. Server logs for authentication issues');
    console.log('  3. Form validation (all required fields filled?)');
    console.log('  4. File upload (image selected?)');

  } catch (error) {
    console.error('❌ Database test failed:', error.message);

    if (error.message.includes('authentication failed')) {
      console.log('');
      console.log('🔐 AUTHENTICATION ISSUE:');
      console.log('  - Check your MongoDB Atlas username and password');
      console.log('  - Verify database user permissions in Atlas');
      console.log('  - Ensure the user has read/write access');
    } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('');
      console.log('🌐 NETWORK ISSUE:');
      console.log('  - Check your internet connection');
      console.log('  - Verify the cluster URL is correct');
      console.log('  - Try pinging the cluster domain');
    } else if (error.message.includes('connection timed out') || error.message.includes('serverSelectionTimeoutMS')) {
      console.log('');
      console.log('⏱️ CONNECTION TIMEOUT:');
      console.log('  - Check MongoDB Atlas IP whitelist');
      console.log('  - Add your IP address (or 0.0.0.0/0 for testing)');
      console.log('  - Verify firewall settings');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('');
      console.log('🚫 CONNECTION REFUSED:');
      console.log('  - MongoDB Atlas cluster might be paused');
      console.log('  - Check cluster status in Atlas dashboard');
    }

    console.log('');
    console.log('💡 MongoDB Atlas Troubleshooting:');
    console.log('  1. Go to https://cloud.mongodb.com');
    console.log('  2. Check your cluster is running (not paused)');
    console.log('  3. Verify Network Access (IP whitelist)');
    console.log('  4. Confirm Database Access (username/password)');
    console.log('  5. Test connection with MongoDB Compass');

    console.log('');
    console.log('Full error details:', error);
  }
}

testDB();
