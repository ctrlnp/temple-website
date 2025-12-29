const express = require('express');
const multer = require('multer');
const path = require('path');
const QRCode = require('../models/QRCode');
const { authenticate } = require('../middleware/auth');
const { cloudinary } = require('../config/cloudinary');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'qr-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
  }
  next(error);
};

// Get all QR codes (admin only)
router.get('/', authenticate, async (req, res) => {
  try {
    const qrCodes = await QRCode.find({})
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });

    res.json(qrCodes);
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    res.status(500).json({ message: 'Failed to fetch QR codes' });
  }
});

// Get active QR code (public)
router.get('/active', async (req, res) => {
  try {
    const qrCode = await QRCode.findOne({ isActive: true });

    if (!qrCode) {
      // Return default QR code if none is active
      return res.json({
        title: 'Temple Donation',
        description: 'Scan this QR code to make a donation to the temple',
        qrImageUrl: 'http://localhost:5000/images/default-qr.png', // Full URL for client access
        eventName: 'General Donation',
        amount: 'Any Amount'
      });
    }

    // Ensure the QR image URL is a full URL that the client can access
    let qrImageUrl = qrCode.qrImageUrl;
    if (qrImageUrl.startsWith('/uploads/')) {
      qrImageUrl = `http://localhost:5000${qrImageUrl}`;
    }

    const responseData = {
      ...qrCode.toObject(),
      qrImageUrl
    };

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching active QR code:', error);
    res.status(500).json({ message: 'Failed to fetch QR code' });
  }
});

// Create new QR code (admin only)
router.post('/', authenticate, upload.single('qrImage'), handleMulterError, async (req, res) => {
  console.log('🔄 QR POST route called');
  console.log('📨 Headers:', JSON.stringify(req.headers.authorization ? 'Bearer token present' : 'No auth header'));
  console.log('📄 Raw body keys:', Object.keys(req.body || {}));
  console.log('📁 File info:', req.file ? {
    filename: req.file.filename,
    originalname: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype
  } : 'No file uploaded');

  try {
    console.log('🔐 Checking authentication...');
    // Validate required user
    if (!req.user || !req.user._id) {
      console.error('❌ No authenticated user found');
      return res.status(401).json({ message: 'Authentication required' });
    }
    console.log('✅ User authenticated:', req.user._id);

    const { title, description, eventName, amount, qrCode } = req.body;
    console.log('📝 Form data:', { title, description, eventName, amount, qrCode });

    let qrImageUrl = '/images/default-qr.png'; // Default QR image

    // Upload to Cloudinary if file provided
    if (req.file) {
      try {
        console.log('Processing QR image...');

        // Check if Cloudinary is configured
        console.log('Cloudinary check:', {
          envValue: `"${process.env.CLOUDINARY_CLOUD_NAME}"`,
          hasEnv: !!process.env.CLOUDINARY_CLOUD_NAME,
          hasCloudinary: !!cloudinary,
          hasUploader: !!(cloudinary && cloudinary.uploader),
          cloudinaryType: typeof cloudinary,
          uploaderType: typeof (cloudinary && cloudinary.uploader)
        });

        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME.trim() && cloudinary && cloudinary.uploader) {
          console.log('Uploading QR image to Cloudinary...');
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'temple/qr-codes',
            public_id: `qr-${Date.now()}`,
            transformation: [{ width: 300, height: 300, crop: 'limit' }]
          });
          qrImageUrl = result.secure_url;
          console.log('QR image uploaded to Cloudinary successfully:', qrImageUrl);
        } else {
          console.log('Cloudinary not configured, storing locally...');
          // Store locally if Cloudinary is not configured
          qrImageUrl = `/uploads/${req.file.filename}`;
          console.log('QR image stored locally:', qrImageUrl);
        }

        // Delete local file after processing (only if uploaded to Cloudinary)
        if (qrImageUrl.startsWith('http')) {
          const fs = require('fs');
          fs.unlinkSync(req.file.path);
          console.log('Local file deleted');
        }
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        // Fallback to local storage if Cloudinary fails
        qrImageUrl = `/uploads/${req.file.filename}`;
        console.log('Falling back to local storage:', qrImageUrl);
      }
    }

    // Validate required user
    if (!req.user || !req.user._id) {
      console.error('No authenticated user found');
      return res.status(401).json({ message: 'Authentication required' });
    }

    console.log('Creating QR in database...');
    const newQRCode = await QRCode.create({
      title: title || 'Temple Donation',
      description: description || 'Scan this QR code to make a donation to the temple',
      qrImageUrl,
      qrCode,
      eventName: eventName || 'General Donation',
      amount: amount || 'Any Amount',
      createdBy: req.user._id
    });

    console.log('QR code created successfully:', newQRCode._id);
    res.status(201).json({
      message: 'QR code created successfully',
      qrCode: newQRCode
    });
  } catch (error) {
    console.error('Error creating QR code:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);

    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        error: error.message
      });
    }

    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return res.status(500).json({
        message: 'Database error',
        error: error.message
      });
    }

    res.status(500).json({
      message: 'Failed to create QR code',
      error: error.message
    });
  }
});

// Update QR code (admin only)
router.patch('/:id', authenticate, upload.single('qrImage'), handleMulterError, async (req, res) => {
  try {
    const { title, description, eventName, amount, qrCode, isActive } = req.body;
    const qrCodeDoc = await QRCode.findById(req.params.id);

    if (!qrCodeDoc) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    // If isActive is not explicitly provided, set it to true for updates (make it active by default)
    const shouldBeActive = isActive !== undefined ? isActive : true;

    // Upload new image if provided
    if (req.file) {
      try {
        console.log('Updating QR image...');

        // Check if Cloudinary is configured
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME.trim() && cloudinary && cloudinary.uploader) {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'temple/qr-codes',
            public_id: `qr-${Date.now()}`,
            transformation: [{ width: 300, height: 300, crop: 'limit' }]
          });

          // Delete old image from Cloudinary if it exists
          if (qrCodeDoc.qrImageUrl && qrCodeDoc.qrImageUrl.includes('cloudinary')) {
            const publicId = qrCodeDoc.qrImageUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`temple/qr-codes/${publicId}`);
          }

          qrCodeDoc.qrImageUrl = result.secure_url;
          console.log('QR image updated on Cloudinary:', qrCodeDoc.qrImageUrl);
        } else {
          console.log('Cloudinary not configured, storing locally...');
          // Store locally if Cloudinary is not configured
          qrCodeDoc.qrImageUrl = `/uploads/${req.file.filename}`;
          console.log('QR image stored locally:', qrCodeDoc.qrImageUrl);
        }

        // Delete local file after processing (only if uploaded to Cloudinary)
        if (qrCodeDoc.qrImageUrl.startsWith('http')) {
          const fs = require('fs');
          fs.unlinkSync(req.file.path);
          console.log('Local file deleted');
        }
      } catch (uploadError) {
        console.error('Upload error during update:', uploadError);
        // Fallback to local storage
        qrCodeDoc.qrImageUrl = `/uploads/${req.file.filename}`;
        console.log('Falling back to local storage during update');
      }
    }

    // Update fields
    if (title !== undefined) qrCodeDoc.title = title;
    if (description !== undefined) qrCodeDoc.description = description;
    if (eventName !== undefined) qrCodeDoc.eventName = eventName;
    if (amount !== undefined) qrCodeDoc.amount = amount;
    if (qrCode !== undefined) qrCodeDoc.qrCode = qrCode;
    // Always set isActive for updates (defaults to true if not specified)
    qrCodeDoc.isActive = shouldBeActive;

    await qrCodeDoc.save();

    res.json({
      message: 'QR code updated successfully',
      qrCode: qrCodeDoc
    });
  } catch (error) {
    console.error('Error updating QR code:', error);
    res.status(500).json({ message: 'Failed to update QR code' });
  }
});

// Delete QR code (admin only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);

    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    // Delete image from Cloudinary if configured
    if (qrCode.qrImageUrl && qrCode.qrImageUrl.includes('cloudinary') && cloudinary && cloudinary.uploader) {
      try {
        const publicId = qrCode.qrImageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`temple/qr-codes/${publicId}`);
        console.log('QR image deleted from Cloudinary');
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
      }
    }

    // Delete local file if it exists
    if (qrCode.qrImageUrl && qrCode.qrImageUrl.startsWith('/uploads/')) {
      try {
        const fs = require('fs');
        const filePath = path.join(__dirname, '../..', qrCode.qrImageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('Local QR image file deleted');
        }
      } catch (fileError) {
        console.error('Error deleting local file:', fileError);
      }
    }

    await QRCode.findByIdAndDelete(req.params.id);

    res.json({ message: 'QR code deleted successfully' });
  } catch (error) {
    console.error('Error deleting QR code:', error);
    res.status(500).json({ message: 'Failed to delete QR code' });
  }
});

// Simple health check for QR routes
router.get('/health', (req, res) => {
  res.json({ status: 'QR routes are working', timestamp: new Date().toISOString() });
});

// Test endpoint to create QR without file (for debugging)
router.post('/test', authenticate, async (req, res) => {
  try {
    console.log('Test QR creation...');
    console.log('User:', req.user ? req.user._id : 'No user');
    console.log('Body:', req.body);

    const testQR = await QRCode.create({
      title: 'Test QR Code',
      description: 'This is a test QR code',
      qrImageUrl: '/images/default-qr.png',
      eventName: 'Test Event',
      amount: '₹100',
      createdBy: req.user._id
    });

    res.status(201).json({
      message: 'Test QR created successfully',
      qrCode: testQR
    });
  } catch (error) {
    console.error('Test QR creation error:', error);
    res.status(500).json({
      message: 'Test QR creation failed',
      error: error.message
    });
  }
});

module.exports = router;
