const { verifyToken } = require('../services/auth.service');
const User = require('../models/user.model');

/**
 * Protects routes requiring authentication
 */
const authenticateToken = async (req, res, next) => {
  try {
    let token = null;

    // Check signed or unsigned cookies
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(401).json({ success: false, message: 'Authentication required. Please login.' });
      }
      return res.redirect('/auth/login?redirect=' + encodeURIComponent(req.originalUrl));
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      res.clearCookie('accessToken');
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
      }
      return res.redirect('/auth/login?error=Session expired. Please login again.');
    }

    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      res.clearCookie('accessToken');
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(401).json({ success: false, message: 'User account is inactive or deleted.' });
      }
      return res.redirect('/auth/login?error=Account is deactivated or does not exist.');
    }

    req.user = user;
    res.locals.currentUser = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication - populates user if token present, but doesn't block if missing
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
    if (token) {
      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id);
        if (user && user.isActive) {
          req.user = user;
          res.locals.currentUser = user;
        }
      } catch (err) {
        // Ignore invalid optional token
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};
