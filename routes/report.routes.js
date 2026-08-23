const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);

// Reports dashboard view
router.get('/', reportController.renderReportsCenter);

// Exports
router.get('/export/excel', reportController.exportContributionsExcel);
router.get('/export/csv', reportController.exportContributionsCSV);
router.get('/export/pdf', reportController.exportPDFReport);
router.get('/export/expenses/excel', reportController.exportExpensesExcel);

module.exports = router;
