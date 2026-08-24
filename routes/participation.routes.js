const express = require('express');
const router = express.Router();
const participationController = require('../controllers/participation.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { ROLES } = require('../config/constants');

// Admin portal views & actions (Auth required)
router.get('/', authenticateToken, participationController.listParticipations);
router.post('/:id/review', authenticateToken, participationController.toggleReview);
router.post('/:id/delete', authenticateToken, requireRole(ROLES.SUPERADMIN), participationController.deleteParticipation);
router.delete('/:id', authenticateToken, requireRole(ROLES.SUPERADMIN), participationController.deleteParticipation);

module.exports = router;
