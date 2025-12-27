const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Media = require('../models/Media');
const { authenticate, isAdmin } = require('../middleware/auth');
const { uploadImageToCloudinary } = require('../config/cloudinary');
const { uploadVideoToYouTube, getAuthUrl, setCredentials } = require('../config/youtube');

const router = express.Router();

// Configure multer to store files temporarily
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(__dirname, '..', 'temp');
    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/avi'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Upload multiple media items (Admin only)
router.post('/', authenticate, isAdmin, upload.array('files', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one file is required' });
    }

    const { title, description, eventName, eventDate } = req.body;

    // Upload all files with the same metadata
    const uploadedMedia = await Promise.all(
      req.files.map(async (file, index) => {
        const isVideo = file.mimetype.startsWith('video/');
        const type = isVideo ? 'video' : 'image';

        // Use file name as title if no title provided, or append index for multiple files
        const mediaTitle = title || file.originalname.replace(/\.[^/.]+$/, '');
        const finalTitle = req.files.length > 1 ? `${mediaTitle} ${index + 1}` : mediaTitle;

        const metadata = {
          title: finalTitle,
          description,
          eventName,
        };

        let mediaData;

        if (type === 'image') {
          // Upload to Cloudinary
          try {
            const imageBuffer = fs.readFileSync(file.path);
            const cloudinaryResult = await uploadImageToCloudinary(imageBuffer, file.originalname);

            mediaData = {
              title: finalTitle,
              description,
              eventName,
              type: 'image',
              imageUrl: cloudinaryResult.url,
              imagePublicId: cloudinaryResult.publicId,
              eventDate: eventDate ? new Date(eventDate) : undefined,
            };
          } catch (cloudinaryError) {
            console.error('Cloudinary upload failed:', cloudinaryError);
            throw new Error(`Failed to upload image ${file.originalname} to Cloudinary`);
          }
        } else if (type === 'video') {
          // Upload to YouTube
          try {
            const youtubeResult = await uploadVideoToYouTube(file.path, metadata);

            mediaData = {
              title: finalTitle,
              description,
              eventName,
              type: 'video',
              videoId: youtubeResult.videoId,
              videoUrl: youtubeResult.url,
              embedUrl: youtubeResult.embedUrl,
              thumbnailUrl: youtubeResult.thumbnailUrl,
              eventDate: eventDate ? new Date(eventDate) : undefined,
            };
          } catch (youtubeError) {
            console.error('YouTube upload failed:', youtubeError);
            throw new Error(`Failed to upload video ${file.originalname} to YouTube`);
          }
        }

        // Clean up temporary file
        try {
          fs.unlinkSync(file.path);
        } catch (cleanupError) {
          console.warn('Failed to clean up temporary file:', cleanupError);
        }

        return await Media.create(mediaData);
      })
    );

    res.status(201).json({
      message: `Successfully uploaded ${uploadedMedia.length} file(s)`,
      media: uploadedMedia,
    });
  } catch (err) {
    console.error('Upload error:', err);

    // Clean up any remaining temporary files
    if (req.files) {
      req.files.forEach(file => {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (cleanupError) {
          console.warn('Failed to clean up temporary file:', cleanupError);
        }
      });
    }

    res.status(500).json({
      message: err.message || 'Failed to upload media',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Get media items, optionally filtered by event name
router.get('/', async (req, res) => {
  try {
    const { eventName } = req.query;
    const query = eventName ? { eventName } : {};
    const items = await Media.find(query).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch media' });
  }
});

// YouTube OAuth routes (for video uploads)
router.get('/youtube/auth', authenticate, isAdmin, (req, res) => {
  try {
    console.log('YouTube Auth Debug:');
    console.log('YOUTUBE_CLIENT_ID:', process.env.YOUTUBE_CLIENT_ID ? process.env.YOUTUBE_CLIENT_ID.substring(0, 20) + '...' : 'NOT SET');
    console.log('YOUTUBE_CLIENT_SECRET:', process.env.YOUTUBE_CLIENT_SECRET ? 'SET' : 'NOT SET');
    console.log('YOUTUBE_REDIRECT_URI:', process.env.YOUTUBE_REDIRECT_URI);

    if (!process.env.YOUTUBE_CLIENT_ID || process.env.YOUTUBE_CLIENT_ID.includes('your_real') || process.env.YOUTUBE_CLIENT_ID.includes('placeholder')) {
      return res.status(400).json({
        message: 'YouTube credentials not properly configured',
        details: 'Please update YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET in your .env file with real credentials from Google Cloud Console'
      });
    }

    const authUrl = getAuthUrl();
    console.log('Generated authUrl:', authUrl.substring(0, 100) + '...');

    res.json({ authUrl });
  } catch (error) {
    console.error('YouTube auth error:', error);
    res.status(500).json({ message: 'Failed to get YouTube auth URL', error: error.message });
  }
});

router.get('/youtube/oauth2callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ message: 'Authorization code required' });
    }

    const tokens = await setCredentials(code);

    // Store tokens in environment or database (you might want to store in DB for production)
    process.env.YOUTUBE_ACCESS_TOKEN = tokens.access_token;
    process.env.YOUTUBE_REFRESH_TOKEN = tokens.refresh_token || process.env.YOUTUBE_REFRESH_TOKEN;

    res.redirect('http://localhost:3000/upload?youtube=authorized');
  } catch (error) {
    console.error('YouTube OAuth callback error:', error);
    res.status(500).json({ message: 'YouTube authorization failed' });
  }
});

module.exports = router;
