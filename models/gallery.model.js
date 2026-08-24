const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
      default: 'Untitled'
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required']
    },
    thumbnailUrl: {
      type: String
    },
    fileId: {
      type: String,
      required: [true, 'ImageKit file ID is required']
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    tags: [{
      type: String,
      trim: true
    }]
  },
  {
    timestamps: true
  }
);

gallerySchema.index({ isPublic: 1, createdAt: -1 });

module.exports = mongoose.model('Gallery', gallerySchema);
