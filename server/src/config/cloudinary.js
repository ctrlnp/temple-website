const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configure Cloudinary with explicit credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
const uploadImageToCloudinary = async (fileBuffer, fileName) => {
  try {
    console.log('Cloudinary upload starting...');
    console.log('File buffer size:', fileBuffer.length, 'bytes');
    console.log('File name:', fileName);
    console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API key present:', !!process.env.CLOUDINARY_API_KEY);

    // Convert buffer to base64
    const base64Data = fileBuffer.toString('base64');
    console.log('Base64 data length:', base64Data.length);

    // Detect image format from file extension or try to determine from buffer
    const ext = fileName.split('.').pop().toLowerCase();
    let mimeType = 'image/jpeg'; // default

    if (ext === 'png') mimeType = 'image/png';
    else if (ext === 'webp') mimeType = 'image/webp';
    else if (ext === 'gif') mimeType = 'image/gif';
    else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';

    const dataURI = `data:${mimeType};base64,${base64Data}`;

    console.log('Using mime type:', mimeType);
    console.log('Data URI length:', dataURI.length);

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'temple-media/images',
      public_id: `${Date.now()}-${fileName.replace(/\.[^/.]+$/, '')}`,
      resource_type: 'image',
      quality: 'auto',
      format: 'webp',
    });

    console.log('Cloudinary upload successful');
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Cloudinary upload error details:', error);
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw new Error(`Failed to upload image ${fileName} to Cloudinary: ${error.message}`);
  }
};

module.exports = {
  cloudinary,
  uploadImageToCloudinary,
};
