const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        return done(null, user);
      }

      // Check if user exists with same email
      user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        // Link Google account to existing user
        user.googleId = profile.id;
        user.isVerified = true;
        await user.save();
        return done(null, user);
      }

      // Create new user
      user = await User.create({
        googleId: profile.id,
        username: profile.displayName,
        email: profile.emails[0].value,
        role: 'admin', // Default to admin for Google OAuth
        isVerified: true,
        avatar: profile.photos[0].value
      });

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

module.exports = passport;
