require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadImageToCloudinary } = require('./src/config/cloudinary');

console.log('Testing full upload process...');

// Configure multer (same as in mediaRoutes.js)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(__dirname, 'temp'); // Fixed path
    console.log('Using temp directory:', tempDir);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = unique + ext;
    console.log('Generated filename:', filename);
    cb(null, filename);
  },
});

const upload = multer({ storage });

// Create a test file
const testImagePath = path.join(__dirname, 'test-image.jpg');
if (!fs.existsSync(testImagePath)) {
  // Create a minimal test image
  const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  fs.writeFileSync(testImagePath, testImageBuffer);
  console.log('Created test image at:', testImagePath);
}

async function testUpload() {
  try {
    // Simulate multer processing
    const mockReq = {
      files: [{
        originalname: 'test-image.jpg',
        mimetype: 'image/jpeg',
        path: testImagePath,
        filename: 'test-image.jpg'
      }]
    };

    console.log('Mock file path:', mockReq.files[0].path);
    console.log('File exists:', fs.existsSync(mockReq.files[0].path));

    if (fs.existsSync(mockReq.files[0].path)) {
      const imageBuffer = fs.readFileSync(mockReq.files[0].path);
      console.log('Image buffer size:', imageBuffer.length, 'bytes');

      const result = await uploadImageToCloudinary(imageBuffer, mockReq.files[0].originalname);
      console.log('✅ Upload successful!');
      console.log('URL:', result.url);

      // Clean up
      fs.unlinkSync(testImagePath);
    } else {
      console.log('❌ Test file does not exist');
    }

  } catch (error) {
    console.log('❌ Upload failed:', error.message);
  }
}

testUpload();
