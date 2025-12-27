const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    eventName: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
    // For images (Cloudinary)
    imageUrl: { type: String }, // Cloudinary URL
    imagePublicId: { type: String }, // Cloudinary public ID for management
    // For videos (YouTube)
    videoId: { type: String }, // YouTube video ID
    videoUrl: { type: String }, // Full YouTube URL
    embedUrl: { type: String }, // YouTube embed URL
    thumbnailUrl: { type: String }, // YouTube thumbnail URL
    // Legacy support (can be removed after migration)
    filePath: { type: String }, // Local file path (for backward compatibility)
    eventDate: { type: Date },
  },
  { timestamps: true }
);

// Virtual for getting the appropriate URL based on type
mediaSchema.virtual('url').get(function() {
  if (this.type === 'image') {
    return this.imageUrl;
  } else if (this.type === 'video') {
    return this.embedUrl || this.videoUrl;
  }
  return null;
});

// Virtual for getting the thumbnail URL
mediaSchema.virtual('thumbnail').get(function() {
  if (this.type === 'image') {
    return this.imageUrl; // Images use their own URL as thumbnail
  } else if (this.type === 'video') {
    return this.thumbnailUrl;
  }
  return null;
});

// Ensure virtual fields are serialized
mediaSchema.set('toJSON', { virtuals: true });
mediaSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Media', mediaSchema);
