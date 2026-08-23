const mongoose = require('mongoose');
const { PAYMENT_METHODS } = require('../config/constants');

const contributionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Contribution amount must be at least ₹1']
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      default: PAYMENT_METHODS.CASH,
      required: true
    },
    transactionReference: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Collector ID is required'],
      index: true
    },
    collectedByName: {
      type: String,
      required: true,
      trim: true
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    collectedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Contribution', contributionSchema);
