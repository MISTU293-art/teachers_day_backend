const express = require('express');
const router = express.Router();
const participationController = require('../controllers/participation.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { ROLES } = require('../config/constants');

// Admin portal views & actions (Auth required)
router.get('/', authenticateToken, participationController.listParticipations);

// Export routes
router.get('/export/excel', authenticateToken, participationController.exportParticipationsExcel);
router.get('/export/csv', authenticateToken, participationController.exportParticipationsCSV);

// Review & delete actions
router.post('/:id/review', authenticateToken, participationController.toggleReview);
router.post('/:id/delete', authenticateToken, requireRole(ROLES.SUPERADMIN), participationController.deleteParticipation);
router.delete('/:id', authenticateToken, requireRole(ROLES.SUPERADMIN), participationController.deleteParticipation);

module.exports = router;
