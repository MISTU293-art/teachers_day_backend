/**
 * 404 Handler
 */
const notFoundHandler = (req, res, next) => {
  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.status(404).json({
      success: false,
      message: `Endpoint ${req.method} ${req.originalUrl} not found.`
    });
  }

  res.status(404).render('errors/404', {
    title: '404 - Page Not Found',
    path: req.originalUrl,
    currentUser: req.user || null
  });
};

/**
 * Global Centralized Error Handler
 */
const errorHandler = (err, req, res, next) => {
  console.error('[Error Occurred]:', err.stack || err.message);

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const message = err.message || 'An unexpected internal server error occurred.';

  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  res.status(statusCode).render(`errors/${statusCode === 403 ? '403' : statusCode === 400 ? '400' : '500'}`, {
    title: `Error ${statusCode}`,
    message,
    statusCode,
    currentUser: req.user || null
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
