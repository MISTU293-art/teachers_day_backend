const mongoose = require('mongoose');
const { EXPENSE_CATEGORIES, EXPENSE_STATUS, PAYMENT_METHODS } = require('../config/constants');

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    category: {
      type: String,
      enum: EXPENSE_CATEGORIES,
      required: [true, 'Category is required'],
      index: true
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be at least ₹1']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    paidTo: {
      type: String,
      required: [true, 'Vendor / Payee name is required'],
      trim: true
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      default: PAYMENT_METHODS.CASH
    },
    expenseDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    receipt: {
      type: String,
      trim: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Added by user ID is required'],
      index: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: [EXPENSE_STATUS.PENDING, EXPENSE_STATUS.APPROVED, EXPENSE_STATUS.REJECTED],
      default: EXPENSE_STATUS.PENDING,
      index: true
    },
    rejectionReason: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Expense', expenseSchema);
