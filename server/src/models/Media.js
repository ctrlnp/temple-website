const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    eventName: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
    filePath: { type: String, required: true }, // e.g. /uploads/...
    eventDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Media', mediaSchema);


