const { body } = require('express-validator');
const { EXPENSE_CATEGORIES, PAYMENT_METHODS } = require('../config/constants');

const expenseValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Expense title is required')
    .isLength({ max: 150 })
    .withMessage('Title cannot exceed 150 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(EXPENSE_CATEGORIES)
    .withMessage('Invalid expense category'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 1, max: 1000000 })
    .withMessage('Expense amount must be between ₹1 and ₹10,00,000'),
  body('paidTo')
    .trim()
    .notEmpty()
    .withMessage('Payee/Vendor name is required'),
  body('paymentMethod')
    .optional()
    .isIn(Object.values(PAYMENT_METHODS))
    .withMessage('Invalid payment method'),
  body('expenseDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Invalid date format'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
];

module.exports = {
  expenseValidator
};
