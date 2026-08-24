const mongoose = require('mongoose');
const { YEARS, PERFORMANCE_TYPES } = require('../config/constants');

const participationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    contact: {
      type: String,
      required: [true, 'Contact (phone or email) is required'],
      trim: true
    },
    year: {
      type: String,
      enum: [YEARS.FIRST, YEARS.SECOND, YEARS.THIRD, YEARS.FOURTH],
      required: [true, 'Academic year is required']
    },
    performance: {
      type: String,
      enum: PERFORMANCE_TYPES,
      required: [true, 'Performance type is required']
    },
    performanceDetails: {
      type: String,
      trim: true,
      maxlength: [500, 'Details cannot exceed 500 characters']
    },
    teamMembers: {
      type: String,
      trim: true,
      maxlength: [500, 'Team members text cannot exceed 500 characters']
    },
    isReviewed: {
      type: Boolean,
      default: false
    },
    reviewNotes: {
      type: String,
      trim: true
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

participationSchema.index({ isReviewed: 1, createdAt: -1 });

module.exports = mongoose.model('Participation', participationSchema);
