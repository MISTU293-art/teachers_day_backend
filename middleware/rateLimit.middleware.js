const rateLimit = require('express-rate-limit');

/**
 * Strict Rate Limiter for Login Endpoint (brute force protection)
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  }
});

/**
 * Standard API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    success: false,
    message: 'Too many requests. Please slow down.'
  }
});

module.exports = {
  loginLimiter,
  apiLimiter
};
