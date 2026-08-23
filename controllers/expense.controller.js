const Expense = require('../models/expense.model');
const auditService = require('../services/audit.service');
const { getPagination, buildPaginationData } = require('../utils/pagination');
const { AUDIT_MODULES, AUDIT_ACTIONS, EXPENSE_CATEGORIES, EXPENSE_STATUS, PAYMENT_METHODS, ROLES } = require('../config/constants');
const asyncHandler = require('../utils/asyncHandler');

/**
 * List all expenses with status filters, pagination, and totals
 */
const listExpenses = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { category, status, search } = req.query;

  const filter = {};

  if (category && EXPENSE_CATEGORIES.includes(category)) {
    filter.category = category;
  }

  if (status && Object.values(EXPENSE_STATUS).includes(status)) {
    filter.status = status;
  }

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [{ title: regex }, { paidTo: regex }, { description: regex }];
  }

  const [expenses, totalRecords, totalsAgg] = await Promise.all([
    Expense.find(filter)
      .populate('addedBy', 'name email role')
      .populate('approvedBy', 'name email')
      .sort({ expenseDate: -1 })
      .skip(skip)
      .limit(limit),
    Expense.countDocuments(filter),
    Expense.aggregate([
      {
        $group: {
          _id: '$status',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  let approvedTotal = 0;
  let pendingTotal = 0;
  let rejectedTotal = 0;

  totalsAgg.forEach(item => {
    if (item._id === EXPENSE_STATUS.APPROVED) approvedTotal = item.total;
    if (item._id === EXPENSE_STATUS.PENDING) pendingTotal = item.total;
    if (item._id === EXPENSE_STATUS.REJECTED) rejectedTotal = item.total;
  });

  const pagination = buildPaginationData(totalRecords, page, limit);

  res.render('expenses/index', {
    title: 'Expense Management | CSE EventLedger',
    expenses,
    pagination,
    categories: EXPENSE_CATEGORIES,
    statuses: Object.values(EXPENSE_STATUS),
    paymentMethods: Object.values(PAYMENT_METHODS),
    query: req.query,
    totals: { approvedTotal, pendingTotal, rejectedTotal },
    currentUser: req.user
  });
});

/**
 * Add a new expense
 */
const createExpense = asyncHandler(async (req, res) => {
  const { title, category, amount, description, paidTo, paymentMethod, expenseDate } = req.body;
  const parsedAmount = parseFloat(amount);

  const isSuperAdmin = req.user.role === ROLES.SUPERADMIN;

  const expense = new Expense({
    title,
    category,
    amount: parsedAmount,
    description,
    paidTo,
    paymentMethod: paymentMethod || PAYMENT_METHODS.CASH,
    expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
    addedBy: req.user._id,
    // SuperAdmin additions are auto-approved, volunteers need review
    status: isSuperAdmin ? EXPENSE_STATUS.APPROVED : EXPENSE_STATUS.PENDING,
    approvedBy: isSuperAdmin ? req.user._id : undefined
  });

  await expense.save();

  await auditService.log({
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: AUDIT_ACTIONS.CREATE_EXPENSE,
    module: AUDIT_MODULES.EXPENSES,
    recordId: expense._id,
    description: `Added expense "${expense.title}" for ₹${parsedAmount} (Category: ${expense.category}, Status: ${expense.status})`,
    req
  });

  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.status(201).json({ success: true, message: 'Expense recorded successfully', data: expense });
  }

  res.redirect('/expenses?msg=Expense submitted successfully');
});

/**
 * SuperAdmin: Approve an expense
 */
const approveExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) {
    return res.status(404).json({ success: false, message: 'Expense record not found.' });
  }

  expense.status = EXPENSE_STATUS.APPROVED;
  expense.approvedBy = req.user._id;
  expense.rejectionReason = undefined;
  await expense.save();

  await auditService.log({
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: AUDIT_ACTIONS.APPROVE_EXPENSE,
    module: AUDIT_MODULES.EXPENSES,
    recordId: expense._id,
    description: `SuperAdmin ${req.user.name} approved expense: "${expense.title}" (₹${expense.amount})`,
    req
  });

  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.json({ success: true, message: `Expense "${expense.title}" approved!` });
  }

  res.redirect('/expenses?msg=Expense approved');
});

/**
 * SuperAdmin: Reject an expense
 */
const rejectExpense = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const expense = await Expense.findById(req.params.id);
  if (!expense) {
    return res.status(404).json({ success: false, message: 'Expense record not found.' });
  }

  expense.status = EXPENSE_STATUS.REJECTED;
  expense.approvedBy = req.user._id;
  expense.rejectionReason = reason || 'Rejected by SuperAdmin';
  await expense.save();

  await auditService.log({
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: AUDIT_ACTIONS.REJECT_EXPENSE,
    module: AUDIT_MODULES.EXPENSES,
    recordId: expense._id,
    description: `SuperAdmin ${req.user.name} rejected expense: "${expense.title}" (₹${expense.amount}). Reason: ${expense.rejectionReason}`,
    req
  });

  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.json({ success: true, message: `Expense "${expense.title}" marked as rejected.` });
  }

  res.redirect('/expenses?msg=Expense rejected');
});

module.exports = {
  listExpenses,
  createExpense,
  approveExpense,
  rejectExpense
};
