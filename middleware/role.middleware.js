/**
 * Role-Based Access Control Middleware
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }
      return res.redirect('/auth/login');
    }

    if (!allowedRoles.includes(req.user.role)) {
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You do not have permission to perform this action.'
        });
      }
      return res.status(403).render('errors/403', {
        title: 'Access Forbidden',
        message: 'You do not have permission to view or manage this section.',
        currentUser: req.user
      });
    }

    next();
  };
};

module.exports = {
  requireRole
};
