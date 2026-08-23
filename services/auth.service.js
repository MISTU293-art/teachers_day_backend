const jwt = require('jsonwebtoken');
const env = require('../config/env.config');
const User = require('../models/user.model');

/**
 * Generates JWT access token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    env.accessTokenSecret,
    {
      expiresIn: env.accessTokenExpiresIn
    }
  );
};

/**
 * Verifies JWT token
 */
const verifyToken = (token) => {
  return jwt.verify(token, env.accessTokenSecret);
};

/**
 * Authenticates user credentials
 */
const authenticate = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user) {
    return { user: null, message: 'Invalid email or password' };
  }

  if (!user.isActive) {
    return { user: null, message: 'Your account has been deactivated. Please contact SuperAdmin.' };
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return { user: null, message: 'Invalid email or password' };
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user);
  return { user, token, message: 'Authenticated successfully' };
};

module.exports = {
  generateToken,
  verifyToken,
  authenticate
};
