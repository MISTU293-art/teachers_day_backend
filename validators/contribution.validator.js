const { body } = require('express-validator');
const { PAYMENT_METHODS } = require('../config/constants');

const contributionValidator = [
  body('studentId')
    .notEmpty()
    .withMessage('Student selection is required')
    .isMongoId()
    .withMessage('Invalid student ID format'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 1, max: 100000 })
    .withMessage('Contribution amount must be between ₹1 and ₹1,00,000'),
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(Object.values(PAYMENT_METHODS))
    .withMessage('Invalid payment method'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

module.exports = {
  contributionValidator
};
