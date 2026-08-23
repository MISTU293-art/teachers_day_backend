const { body } = require('express-validator');
const { YEARS } = require('../config/constants');

const studentValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Student name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('year')
    .notEmpty()
    .withMessage('Year is required')
    .isIn(Object.values(YEARS))
    .withMessage('Invalid academic year selected'),
  body('rollNumber')
    .optional({ checkFalsy: true })
    .trim()
    .toUpperCase(),
  body('registrationNumber')
    .optional({ checkFalsy: true })
    .trim()
    .toUpperCase(),
  body('amount')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Contribution amount must be a positive number'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 digits'),
  body('department')
    .optional()
    .trim(),
  body('section')
    .optional()
    .trim()
    .toUpperCase()
];

module.exports = {
  studentValidator
};
