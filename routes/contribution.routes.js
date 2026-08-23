const express = require('express');
const router = express.Router();
const contributionController = require('../controllers/contribution.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { contributionValidator } = require('../validators/contribution.validator');
const { validateRequest } = require('../middleware/validation.middleware');

router.use(authenticateToken);

// Ledger list
router.get('/', contributionController.listContributions);

// Collect money interface
router.get('/collect', contributionController.renderCollectMoney);

// Process contribution (with 1st-year block and auto-collector)
router.post('/', contributionValidator, validateRequest, contributionController.processContribution);

// View and download receipts
router.get('/:id/receipt', contributionController.viewReceipt);
router.get('/:id/receipt/pdf', contributionController.downloadReceiptPDF);

module.exports = router;
