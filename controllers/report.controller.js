const Contribution = require('../models/contribution.model');
const Expense = require('../models/expense.model');
const Student = require('../models/student.model');
const User = require('../models/user.model');
const auditService = require('../services/audit.service');
const exportService = require('../services/export.service');
const pdfService = require('../services/pdf.service');
const { AUDIT_MODULES, AUDIT_ACTIONS, YEARS, PAYMENT_METHODS, EXPENSE_STATUS, ROLES } = require('../config/constants');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Render Reports Center
 */
const renderReportsCenter = asyncHandler(async (req, res) => {
  const admins = await User.find({ role: { $in: [ROLES.ADMIN, ROLES.SUPERADMIN] } }).select('name email');

  // Overall financial summary
  const [collectionAgg, expenseAgg] = await Promise.all([
    Contribution.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]),
    Expense.aggregate([
      { $match: { status: EXPENSE_STATUS.APPROVED } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ])
  ]);

  const totalCollected = collectionAgg[0]?.total || 0;
  const totalExpenses = expenseAgg[0]?.total || 0;
  const balance = totalCollected - totalExpenses;

  res.render('reports/index', {
    title: 'Financial Reports & Analytics | CSE EventLedger',
    admins,
    years: Object.values(YEARS),
    paymentMethods: Object.values(PAYMENT_METHODS),
    totalCollected,
    totalExpenses,
    balance,
    currentUser: req.user
  });
});

/**
 * Export Contributions to Excel (.xlsx)
 */
const exportContributionsExcel = asyncHandler(async (req, res) => {
  const { year, paymentMethod, adminId, fromDate, toDate } = req.query;

  const matchFilter = { isDeleted: false };
  if (paymentMethod) matchFilter.paymentMethod = paymentMethod;
  if (adminId) matchFilter.collectedBy = adminId;
  if (fromDate || toDate) {
    matchFilter.collectedAt = {};
    if (fromDate) matchFilter.collectedAt.$gte = new Date(fromDate);
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      matchFilter.collectedAt.$lte = end;
    }
  }

  let studentFilter = {};
  if (year) studentFilter.year = year;
  if (Object.keys(studentFilter).length > 0) {
    const studentIds = (await Student.find(studentFilter).select('_id')).map(s => s._id);
    matchFilter.student = { $in: studentIds };
  }

  const contributions = await Contribution.find(matchFilter)
    .populate('student')
    .sort({ collectedAt: -1 });

  const workbook = await exportService.exportContributionsToExcel(contributions);

  await auditService.log({
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: AUDIT_ACTIONS.EXPORT_REPORT,
    module: AUDIT_MODULES.REPORTS,
    description: `Exported ${contributions.length} contribution records to Excel (.xlsx)`,
    req
  });

  const filename = `CSE_TeachersDay_Collections_${new Date().toISOString().slice(0, 10)}.xlsx`;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  await workbook.xlsx.write(res);
  res.end();
});

/**
 * Export Contributions to CSV
 */
const exportContributionsCSV = asyncHandler(async (req, res) => {
  const contributions = await Contribution.find({ isDeleted: false })
    .populate('student')
    .sort({ collectedAt: -1 });

  const csvContent = exportService.exportContributionsToCSV(contributions);

  await auditService.log({
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: AUDIT_ACTIONS.EXPORT_REPORT,
    module: AUDIT_MODULES.REPORTS,
    description: `Exported ${contributions.length} contribution records to CSV`,
    req
  });

  const filename = `CSE_TeachersDay_Collections_${new Date().toISOString().slice(0, 10)}.csv`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  res.send(csvContent);
});

/**
 * Export Complete PDF Financial Report
 */
const exportPDFReport = asyncHandler(async (req, res) => {
  const [contributions, collectionAgg, expenseAgg] = await Promise.all([
    Contribution.find({ isDeleted: false })
      .populate('student')
      .sort({ collectedAt: -1 }),
    Contribution.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Expense.aggregate([
      { $match: { status: EXPENSE_STATUS.APPROVED } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  const stats = {
    totalCollected: collectionAgg[0]?.total || 0,
    totalApprovedExpenses: expenseAgg[0]?.total || 0
  };

  await auditService.log({
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: AUDIT_ACTIONS.EXPORT_REPORT,
    module: AUDIT_MODULES.REPORTS,
    description: `Generated and downloaded PDF Financial Report (${contributions.length} records)`,
    req
  });

  const filename = `CSE_TeachersDay_Financial_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

  const pdfDoc = pdfService.generateCollectionReportPDF(contributions, stats);
  pdfDoc.pipe(res);
});

/**
 * Export Expenses to Excel
 */
const exportExpensesExcel = asyncHandler(async (req, res) => {
  const expenses = await Expense.find().populate('addedBy', 'name').sort({ expenseDate: -1 });

  const workbook = await exportService.exportExpensesToExcel(expenses);

  await auditService.log({
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: AUDIT_ACTIONS.EXPORT_REPORT,
    module: AUDIT_MODULES.REPORTS,
    description: `Exported ${expenses.length} expense records to Excel (.xlsx)`,
    req
  });

  const filename = `CSE_TeachersDay_Expenses_${new Date().toISOString().slice(0, 10)}.xlsx`;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  await workbook.xlsx.write(res);
  res.end();
});

module.exports = {
  renderReportsCenter,
  exportContributionsExcel,
  exportContributionsCSV,
  exportPDFReport,
  exportExpensesExcel
};
