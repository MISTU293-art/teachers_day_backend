const mongoose = require('mongoose');
const { YEARS, CONTRIBUTION_STATUS } = require('../config/constants');
const crypto = require('crypto');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      maxlength: [100, 'Student name cannot exceed 100 characters']
    },
    rollNumber: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    registrationNumber: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      default: 'Computer Science & Engineering',
      trim: true
    },
    year: {
      type: String,
      enum: [YEARS.FIRST, YEARS.SECOND, YEARS.THIRD, YEARS.FOURTH],
      required: [true, 'Academic year is required'],
      index: true
    },
    semester: {
      type: Number,
      min: 1,
      max: 8
    },
    section: {
      type: String,
      trim: true,
      uppercase: true,
      default: 'A'
    },
    contributionStatus: {
      type: String,
      enum: [
        CONTRIBUTION_STATUS.PENDING,
        CONTRIBUTION_STATUS.PARTIALLY_PAID,
        CONTRIBUTION_STATUS.PAID,
        CONTRIBUTION_STATUS.NOT_ELIGIBLE
      ],
      default: function () {
        return this.year === YEARS.FIRST ? CONTRIBUTION_STATUS.NOT_ELIGIBLE : CONTRIBUTION_STATUS.PENDING;
      },
      index: true
    },
    totalContributed: {
      type: Number,
      default: 0,
      min: 0
    },
    lastCollectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastCollectedByName: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to generate roll/reg if not provided and handle 1st year
studentSchema.pre('save', function (next) {
  if (!this.rollNumber) {
    const yearCode = this.year === YEARS.FIRST ? '26' : this.year === YEARS.SECOND ? '25' : this.year === YEARS.THIRD ? '24' : '23';
    const rand = Math.floor(100 + Math.random() * 900);
    this.rollNumber = `CSE-${yearCode}-${rand}`;
  }
  if (!this.registrationNumber) {
    const hex = crypto.randomBytes(3).toString('hex').toUpperCase();
    this.registrationNumber = `REG${hex}`;
  }
  if (this.year === YEARS.FIRST) {
    this.contributionStatus = CONTRIBUTION_STATUS.NOT_ELIGIBLE;
    this.totalContributed = 0;
    this.lastCollectedByName = undefined;
  }
  next();
});

module.exports = mongoose.model('Student', studentSchema);
