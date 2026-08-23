const Contribution = require('../models/contribution.model');
const Student = require('../models/student.model');
const auditService = require('../services/audit.service');
const pdfService = require('../services/pdf.service');
const generateTransactionId = require('../utils/generateTransactionId');
const { getPagination, buildPaginationData } = require('../utils/pagination');
const { AUDIT_MODULES, AUDIT_ACTIONS, YEARS, PAYMENT_METHODS, CONTRIBUTION_STATUS } = require('../config/constants');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Render the Fast Collection Terminal UI
 */
const renderCollectMoney = asyncHandler(async (req, res) => {
  let selectedStudent = null;
  if (req.query.studentId) {
    selectedStudent = await Student.findById(req.query.studentId);
  }

  res.render('contributions/collect', {
    title: 'Collect Contribution | CSE EventLedger',
    selectedStudent,
    paymentMethods: Object.values(PAYMENT_METHODS),
    currentUser: req.user
  });
});

/**
 * Process and record a student contribution
 */
const processContribution = asyncHandler(async (req, res) => {
  const { studentId, amount, paymentMethod, notes, allowMultiple } = req.body;
  const parsedAmount = parseFloat(amount);

  if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid contribution amount. Amount must be greater than ₹0.'
    });
  }

  // 1. Fetch Student from MongoDB
  const student = await Student.findById(studentId);
  if (!student || !student.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Selected student record was not found.'
    });
  }

  // 2. BACKEND STRICT ENFORCEMENT: First-Year Students CANNOT Contribute
  if (student.year === YEARS.FIRST || student.year === '1st Year' || student.year === '1st') {
    await auditService.log({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: AUDIT_ACTIONS.REJECTED_CONTRIBUTION_FIRST_YEAR,
      module: AUDIT_MODULES.CONTRIBUTIONS,
      recordId: student._id,
      description: `Security rejection: ${req.user.name} attempted contribution (₹${parsedAmount}) from 1st-Year student ${student.name} (${student.rollNumber}).`,
      req
    });

    return res.status(403).json({
      success: false,
      isFirstYear: true,
      message: "⚠️ Contribution Not Allowed: First-year students are not eligible for Teachers' Day contribution."
    });
  }

  // 3. Duplicate / Previous Contribution Check
  const previousContributions = await Contribution.find({ student: student._id, isDeleted: false });
  const hasContributedBefore = previousContributions.length > 0;

  if (hasContributedBefore && !allowMultiple) {
    const totalPrevious = previousContributions.reduce((sum, c) => sum + c.amount, 0);
    return res.status(409).json({
      success: false,
      isDuplicate: true,
      totalPrevious,
      message: `This student has already contributed ₹${totalPrevious}. Do you wish to record an additional contribution?`
    });
  }

  // 4. Generate Unique Transaction Reference
  const transactionReference = generateTransactionId();

  // 5. Automatic Collector Identification (NEVER trusted from frontend payload)
  const contribution = new Contribution({
    student: student._id,
    amount: parsedAmount,
    paymentMethod: paymentMethod || PAYMENT_METHODS.CASH,
    transactionReference,
    collectedBy: req.user._id,       // Derived strictly from authenticated JWT session
    collectedByName: req.user.name, // Derived strictly from authenticated user object
    notes: notes ? notes.trim() : ''
  });

  await contribution.save();

  // 6. Update Student Balance and Status
  student.totalContributed = (student.totalContributed || 0) + parsedAmount;
  student.contributionStatus = CONTRIBUTION_STATUS.PAID;
  await student.save();

  // 7. Record Audit Log
  await auditService.log({
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: AUDIT_ACTIONS.CREATE_CONTRIBUTION,
    module: AUDIT_MODULES.CONTRIBUTIONS,
    recordId: contribution._id,
    description: `Collected ₹${parsedAmount} (${paymentMethod}) from ${student.name} [Roll: ${student.rollNumber}]. Tx: ${transactionReference}`,
    req
  });

  res.status(201).json({
    success: true,
    message: `Payment of ₹${parsedAmount} recorded successfully!`,
    data: {
      contributionId: contribution._id,
      transactionReference,
      studentName: student.name,
      rollNumber: student.rollNumber,
      amount: parsedAmount,
      collectedByName: req.user.name,
      receiptUrl: `/contributions/${contribution._id}/receipt`
    }
  });
});

/**
 * List all contributions with search, filter, and server-side pagination
 */
const listContributions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { search, paymentMethod, year, fromDate, toDate } = req.query;

  const matchFilter = { isDeleted: false };

  if (paymentMethod && Object.values(PAYMENT_METHODS).includes(paymentMethod)) {
    matchFilter.paymentMethod = paymentMethod;
  }

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
  if (year && Object.values(YEARS).includes(year)) {
    studentFilter.year = year;
  }

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    studentFilter.$or = [
      { name: regex },
      { rollNumber: regex },
      { registrationNumber: regex }
    ];
  }

  // Find matching student IDs if student search/filter applied
  if (Object.keys(studentFilter).length > 0) {
    const matchingStudents = await Student.find(studentFilter).select('_id');
    const studentIds = matchingStudents.map(s => s._id);
    matchFilter.student = { $in: studentIds };
  }

  const [contributions, totalRecords, totalAmountAgg] = await Promise.all([
    Contribution.find(matchFilter)
      .populate('student', 'name rollNumber registrationNumber department year')
      .populate('collectedBy', 'name email')
      .sort({ collectedAt: -1 })
      .skip(skip)
      .limit(limit),
    Contribution.countDocuments(matchFilter),
    Contribution.aggregate([
      { $match: matchFilter },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  const pagination = buildPaginationData(totalRecords, page, limit);
  const totalFilteredAmount = totalAmountAgg[0]?.total || 0;

  res.render('contributions/index', {
    title: 'Contributions Ledger | CSE EventLedger',
    contributions,
    pagination,
    totalFilteredAmount,
    query: req.query,
    paymentMethods: Object.values(PAYMENT_METHODS),
    years: Object.values(YEARS),
    currentUser: req.user
  });
});

/**
 * View HTML Receipt for printing
 */
const viewReceipt = asyncHandler(async (req, res) => {
  const contribution = await Contribution.findById(req.params.id)
    .populate('student')
    .populate('collectedBy', 'name email');

  if (!contribution || contribution.isDeleted) {
    return res.status(404).render('errors/404', { title: 'Receipt Not Found', message: 'Contribution receipt not found.', currentUser: req.user });
  }

  res.render('contributions/receipt', {
    title: `Receipt ${contribution.transactionReference} | CSE EventLedger`,
    contribution,
    currentUser: req.user
  });
});

/**
 * Download Receipt PDF
 */
const downloadReceiptPDF = asyncHandler(async (req, res) => {
  const contribution = await Contribution.findById(req.params.id)
    .populate('student')
    .populate('collectedBy', 'name email');

  if (!contribution || contribution.isDeleted) {
    return res.status(404).json({ success: false, message: 'Receipt not found.' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=Receipt_${contribution.transactionReference}.pdf`);

  const pdfDoc = pdfService.generateReceiptPDF(contribution);
  pdfDoc.pipe(res);
});

module.exports = {
  renderCollectMoney,
  processContribution,
  listContributions,
  viewReceipt,
  downloadReceiptPDF
};
