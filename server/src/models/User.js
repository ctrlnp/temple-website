const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function() {
        return !this.googleId; // Password required only if not using Google OAuth
      },
      minlength: 6,
    },
    googleId: {
      type: String,
      sparse: true, // Allows multiple null values but unique non-null values
    },
    avatar: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    if (typeof next === 'function') return next();
    return;
  }
  try {
    this.password = await bcrypt.hash(this.password, 10);
    if (typeof next === 'function') return next();
  } catch (error) {
    if (typeof next === 'function') return next(error);
    throw error;
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
