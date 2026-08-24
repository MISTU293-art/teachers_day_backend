const mongoose = require('mongoose');
const { PROGRAM_CATEGORIES, PROGRAM_STATUS, REGISTRATION_STATUS } = require('../config/constants');

const agendaItemSchema = new mongoose.Schema(
  {
    time: {
      type: String,
      required: true,
      trim: true
    },
    activity: {
      type: String,
      required: true,
      trim: true
    },
    speakerOrPerformer: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const coordinatorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      trim: true,
      default: 'Event Coordinator'
    },
    contact: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const programSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Program title is required'],
      trim: true,
      maxlength: [150, 'Program title cannot exceed 150 characters']
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true
    },
    category: {
      type: String,
      enum: PROGRAM_CATEGORIES,
      default: 'Celebration',
      required: true
    },
    eventDate: {
      type: String,
      required: [true, 'Event date is required (e.g. 3rd September 2026)'],
      trim: true
    },
    eventDateTime: {
      type: Date,
      index: true
    },
    eventTime: {
      type: String,
      required: [true, 'Event time is required (e.g. 10:30 AM - 04:30 PM)'],
      trim: true
    },
    venue: {
      type: String,
      required: [true, 'Venue / Location is required'],
      trim: true,
      default: 'CSE Department Main Seminar Hall (Auditorium 302)'
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [300, 'Short description cannot exceed 300 characters']
    },
    description: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: Object.values(PROGRAM_STATUS),
      default: PROGRAM_STATUS.UPCOMING,
      index: true
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    registrationStatus: {
      type: String,
      enum: Object.values(REGISTRATION_STATUS),
      default: REGISTRATION_STATUS.OPEN
    },
    registrationLink: {
      type: String,
      trim: true
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    posterUrl: {
      type: String,
      trim: true
    },
    agenda: [agendaItemSchema],
    coordinators: [coordinatorSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to generate slug if not provided
programSchema.pre('save', function (next) {
  if (this.title && (!this.slug || this.isModified('title'))) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Program', programSchema);
