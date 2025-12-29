const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: 'Temple Donation'
    },
    description: {
      type: String,
      required: true,
      trim: true,
      default: 'Scan this QR code to make a donation to the temple'
    },
    qrImageUrl: {
      type: String,
      trim: true,
      default: '/images/default-qr.png'
    },
    qrCode: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    eventName: {
      type: String,
      trim: true,
      default: 'General Donation'
    },
    amount: {
      type: String,
      trim: true,
      default: 'Any Amount'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

// Ensure only one active QR code at a time
qrCodeSchema.pre('save', async function () {
  console.log(`QR Pre-save: ${this.title}, isActive: ${this.isActive}, isNew: ${this.isNew}`);

  if (this.isActive) {
    // Always deactivate all other QR codes when this one is active
    console.log('Deactivating all other QR codes');
    const result = await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
    console.log(`Deactivated ${result.modifiedCount} QR codes`);
  }
});

module.exports = mongoose.model('QRCode', qrCodeSchema);
