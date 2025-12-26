const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');

dotenv.config();

async function testLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@temple.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      process.exit(1);
    }

    console.log('✅ Admin user found:');
    console.log('   Email:', admin.email);
    console.log('   Username:', admin.username);
    console.log('   Role:', admin.role);
    console.log('   Password hash:', admin.password.substring(0, 20) + '...');

    // Test password comparison
    const testPassword = 'admin123';
    const isMatch = await admin.comparePassword(testPassword);
    
    console.log('\n🔐 Testing password comparison:');
    console.log('   Test password: admin123');
    console.log('   Password match:', isMatch ? '✅ YES' : '❌ NO');

    if (!isMatch) {
      console.log('\n⚠️  Password mismatch! Creating new admin with correct password...');
      
      // Delete old admin
      await User.deleteOne({ email: 'admin@temple.com' });
      
      // Create new admin
      const newAdmin = await User.create({
        username: 'admin',
        email: 'admin@temple.com',
        password: 'admin123',
        role: 'admin',
      });
      
      console.log('✅ New admin created!');
      console.log('   Email:', newAdmin.email);
      console.log('   Password: admin123');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testLogin();

