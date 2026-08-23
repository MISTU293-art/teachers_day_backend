const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { ROLES } = require('../config/constants');

// SuperAdmin only
router.use(authenticateToken);
router.use(requireRole(ROLES.SUPERADMIN));

router.get('/', auditController.listAuditLogs);

module.exports = router;
