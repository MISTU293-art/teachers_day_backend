const express = require('express');
const router = express.Router();
const programController = require('../controllers/program.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { ROLES } = require('../config/constants');

// All program admin routes require authentication
router.use(authenticateToken);

router.get('/', programController.listPrograms);
router.get('/create', programController.renderCreateProgram);
router.post('/', programController.createProgram);
router.get('/:id/edit', programController.renderEditProgram);
router.post('/:id', programController.updateProgram);
router.post('/:id/delete', requireRole(ROLES.SUPERADMIN), programController.deleteProgram);
router.delete('/:id', requireRole(ROLES.SUPERADMIN), programController.deleteProgram);

module.exports = router;
