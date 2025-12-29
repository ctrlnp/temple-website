const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    functionType: {
      type: String,
      required: true,
      enum: ['wedding', 'engagement', 'reception', 'birthday', 'corporate', 'other'],
    },
    guestCount: {
      type: String,
      required: true,
      enum: ['50-100', '100-200', '200-300', '300-500', '500+'],
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },

    // Legacy fields for backward compatibility (optional - not required)
    groomName: {
      type: String,
      required: false,
      trim: true,
    },
    brideName: {
      type: String,
      required: false,
      trim: true,
    },
    groomPhone: {
      type: String,
      required: false,
      trim: true,
    },
    bridePhone: {
      type: String,
      required: false,
      trim: true,
    },
    contactPerson: {
      type: String,
      required: false,
      trim: true,
    },
    contactPhone: {
      type: String,
      required: false,
      trim: true,
    },
    contactEmail: {
      type: String,
      required: false,
      trim: true,
    },
    eventTime: {
      type: String,
      required: false,
      trim: true,
    },
    requirements: {
      type: String,
      required: false,
      trim: true,
    },
    advanceAmount: {
      type: String,
      required: false,
      trim: true,
    },
    totalAmount: {
      type: String,
      required: false,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    bookingReference: {
      type: String,
      unique: true,
    },
    smsSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Generate booking reference before saving
bookingSchema.pre('save', async function () {
  if (!this.bookingReference) {
    // Generate a unique reference like BK2025001
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.bookingReference = `BK${year}${month}${randomNum}`;
  }
  // No next() call needed for async pre-save hooks
});

module.exports = mongoose.model('Booking', bookingSchema);
