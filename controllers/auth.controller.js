const authService = require('../services/auth.service');
const auditService = require('../services/audit.service');
const { AUDIT_MODULES, AUDIT_ACTIONS } = require('../config/constants');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env.config');

/**
 * Render Login Page
 */
const renderLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/dashboard');
  }
  const redirect = req.query.redirect || '/dashboard';
  const error = req.query.error || null;
  res.render('auth/login', {
    title: 'Login | CSE Teachers\' Day System',
    redirect,
    error,
    superAdminEmailHint: env.superAdmin.email
  });
};

/**
 * Process Login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password, redirect } = req.body;

  const { user, token, message } = await authService.authenticate(email, password);

  if (!user) {
    await auditService.log({
      userName: email,
      action: 'LOGIN_FAILED',
      module: AUDIT_MODULES.AUTH,
      description: `Failed login attempt for email: ${email}`,
      req
    });

    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(401).json({ success: false, message });
    }
    return res.status(401).render('auth/login', {
      title: 'Login | CSE Teachers\' Day System',
      error: message,
      redirect: redirect || '/dashboard',
      superAdminEmailHint: env.superAdmin.email
    });
  }

  // Set HTTP-Only Secure Cookie
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });

  await auditService.log({
    user: user._id,
    userName: user.name,
    userRole: user.role,
    action: AUDIT_ACTIONS.LOGIN,
    module: AUDIT_MODULES.AUTH,
    description: `${user.name} (${user.role}) logged in successfully.`,
    req
  });

  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        redirectUrl: redirect || '/dashboard'
      }
    });
  }

  res.redirect(redirect || '/dashboard');
});

/**
 * Process Logout
 */
const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    await auditService.log({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: AUDIT_ACTIONS.LOGOUT,
      module: AUDIT_MODULES.AUTH,
      description: `${req.user.name} logged out.`,
      req
    });
  }

  res.clearCookie('accessToken');

  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.json({ success: true, message: 'Logged out successfully' });
  }

  res.redirect('/auth/login?msg=Logged out successfully');
});

module.exports = {
  renderLogin,
  login,
  logout
};
