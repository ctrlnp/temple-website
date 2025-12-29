const cloudinary = require('cloudinary').v2;
require('dotenv').config();

console.log('Testing Cloudinary Configuration...');
console.log('=====================================');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.substring(0, 10) + '...' : 'NOT SET');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET');

console.log('\nTesting connection...');

cloudinary.api.ping((error, result) => {
  if (error) {
    console.log('❌ Cloudinary connection FAILED');
    console.log('Error:', error.message);
    if (error.message.includes('Invalid Credentials')) {
      console.log('\n🔧 SOLUTION: The Cloudinary credentials appear to be invalid or placeholder values.');
      console.log('Please get real credentials from: https://cloudinary.com/');
      console.log('Then update your .env file with:');
      console.log('- CLOUDINARY_CLOUD_NAME');
      console.log('- CLOUDINARY_API_KEY');
      console.log('- CLOUDINARY_API_SECRET');
    }
  } else {
    console.log('✅ Cloudinary connection SUCCESSFUL');
    console.log('Result:', result);
  }
  process.exit(error ? 1 : 0);
});
