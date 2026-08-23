const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { createAdminValidator, resetPasswordValidator } = require('../validators/admin.validator');
const { validateRequest } = require('../middleware/validation.middleware');
const { ROLES } = require('../config/constants');

// Entire router is locked to SuperAdmin ONLY
router.use(authenticateToken);
router.use(requireRole(ROLES.SUPERADMIN));

// List administrators
router.get('/', adminController.listAdmins);

// Create admin
router.post('/', createAdminValidator, validateRequest, adminController.createAdmin);

// Toggle active status
router.post('/:id/toggle-status', adminController.toggleAdminStatus);
router.patch('/:id/toggle-status', adminController.toggleAdminStatus);

// Reset password
router.post('/:id/reset-password', resetPasswordValidator, validateRequest, adminController.resetAdminPassword);

module.exports = router;
