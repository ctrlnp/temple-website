require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { uploadImageToCloudinary } = require('./src/config/cloudinary');

async function testImageUpload() {
  try {
    console.log('Testing image upload to Cloudinary...');

    // Create a simple test image (1x1 pixel PNG in base64)
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

    console.log('Test image buffer created, size:', testImageBuffer.length, 'bytes');

    const result = await uploadImageToCloudinary(testImageBuffer, 'test-image.png');

    console.log('✅ Upload successful!');
    console.log('URL:', result.url);
    console.log('Public ID:', result.publicId);

  } catch (error) {
    console.log('❌ Upload failed!');
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

testImageUpload();
