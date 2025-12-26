const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/database');
const path = require('path');
const mediaRoutes = require('./src/routes/mediaRoutes');
const authRoutes = require('./src/routes/authRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Serve uploaded media files
app.use('/uploads', express.static(path.join(__dirname, 'src', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: '🕉️ Welcome to Temple Management API',
    status: 'Running',
    version: '1.0.0'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log('=================================');
});