const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { expenseValidator } = require('../validators/expense.validator');
const { validateRequest } = require('../middleware/validation.middleware');
const { ROLES } = require('../config/constants');

router.use(authenticateToken);

// List expenses
router.get('/', expenseController.listExpenses);

// Add expense
router.post('/', expenseValidator, validateRequest, expenseController.createExpense);

// SuperAdmin only: Approve expense
router.post('/:id/approve', requireRole(ROLES.SUPERADMIN), expenseController.approveExpense);
router.patch('/:id/approve', requireRole(ROLES.SUPERADMIN), expenseController.approveExpense);

// SuperAdmin only: Reject expense
router.post('/:id/reject', requireRole(ROLES.SUPERADMIN), expenseController.rejectExpense);
router.patch('/:id/reject', requireRole(ROLES.SUPERADMIN), expenseController.rejectExpense);

module.exports = router;
