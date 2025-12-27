const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const session = require('express-session');
const connectDB = require('./src/config/database');
const path = require('path');
const mediaRoutes = require('./src/routes/mediaRoutes');
const authRoutes = require('./src/routes/authRoutes');

// Load environment variables FIRST
dotenv.config();

// Initialize Passport AFTER dotenv
require('./src/config/passport');

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.JWT_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

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
