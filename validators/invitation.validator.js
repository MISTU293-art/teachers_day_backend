const { body } = require('express-validator');

const invitationValidator = [
  body('teacherName')
    .trim()
    .notEmpty()
    .withMessage('Teacher name is required')
    .isLength({ max: 100 })
    .withMessage('Teacher name cannot exceed 100 characters'),
  body('designation')
    .trim()
    .notEmpty()
    .withMessage('Designation is required'),
  body('department')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Department cannot be empty'),
  body('message')
    .optional()
    .trim(),
  body('joke')
    .optional()
    .trim(),
  body('eventDate')
    .optional()
    .trim(),
  body('eventTime')
    .optional()
    .trim(),
  body('venue')
    .optional()
    .trim(),
  body('theme')
    .optional()
    .isIn(['cyber-gold', 'matrix-green', 'tech-purple', 'classic-navy'])
    .withMessage('Invalid card theme selected')
];

module.exports = {
  invitationValidator
};
