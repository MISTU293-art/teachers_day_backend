const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/', dashboardController.renderDashboard);
router.get('/analytics', dashboardController.getAnalytics);

module.exports = router;
