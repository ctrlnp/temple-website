// Debug environment variables loading
require('dotenv').config();

console.log('Environment Variables Debug:');
console.log('=============================');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '***SET***' : 'NOT SET');

console.log('\nFull .env file path:', require('path').resolve('.env'));
console.log('Current working directory:', process.cwd());

const fs = require('fs');
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  console.log('\n.env file contents:');
  console.log(envContent);
} catch (error) {
  console.log('\nError reading .env file:', error.message);
}
