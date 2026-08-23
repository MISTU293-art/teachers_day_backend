const { validationResult } = require('express-validator');

/**
 * Validates request schema and handles errors for API / Form submissions
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(400).json({
        success: false,
        message: errorMessages[0] || 'Validation failed',
        errors: errors.array()
      });
    }

    // Flash-like query or response handling
    return res.status(400).render('errors/400', {
      title: 'Invalid Input',
      message: errorMessages.join(', '),
      errors: errors.array(),
      currentUser: req.user || null
    });
  }
  next();
};

module.exports = {
  validateRequest
};
