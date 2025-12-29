const cloudinary = require('cloudinary').v2;
require('dotenv').config();

console.log('Testing Cloudinary Credentials...');
console.log('==================================');

// Check if env vars are loaded
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.substring(0, 5) + '...' : 'NOT SET');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET');

// Configure Cloudinary
try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('✅ Cloudinary configured successfully');
} catch (error) {
  console.log('❌ Cloudinary configuration failed:', error.message);
  process.exit(1);
}

// Test basic ping
console.log('\nTesting API connection...');
cloudinary.api.ping()
  .then(result => {
    console.log('✅ Cloudinary API connection successful!');
    console.log('Account Status:', result.status);
    process.exit(0);
  })
  .catch(error => {
    console.log('❌ Cloudinary API connection failed!');
    console.log('Error:', error.message);
    if (error.http_code) {
      console.log('HTTP Code:', error.http_code);
    }
    process.exit(1);
  });
