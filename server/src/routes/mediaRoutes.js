const express = require('express');
const multer = require('multer');
const path = require('path');
const Media = require('../models/Media');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure multer storage (local uploads folder)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'video/mp4', 'video/quicktime'];
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
      req.files.map(async (file) => {
        // Auto-detect type based on file mimetype
        const isVideo = file.mimetype.startsWith('video/');
        const type = isVideo ? 'video' : 'image';

        // Use file name as title if no title provided, or append index
        const mediaTitle = title || file.originalname.replace(/\.[^/.]+$/, '');

        return await Media.create({
          title: mediaTitle,
          description,
          eventName,
          type,
          eventDate: eventDate ? new Date(eventDate) : undefined,
          filePath: `/uploads/${file.filename}`,
        });
      })
    );

    res.status(201).json({
      message: `Successfully uploaded ${uploadedMedia.length} file(s)`,
      media: uploadedMedia,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to upload media' });
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

module.exports = router;


