const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
const uploadImageToCloudinary = async (fileBuffer, fileName) => {
  try {
    // Convert buffer to base64
    const base64Data = fileBuffer.toString('base64');
    const dataURI = `data:image/jpeg;base64,${base64Data}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'temple-media/images',
      public_id: `${Date.now()}-${fileName.replace(/\.[^/.]+$/, '')}`,
      resource_type: 'image',
      quality: 'auto',
      format: 'webp',
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

module.exports = {
  cloudinary,
  uploadImageToCloudinary,
};
