const Student = require('../models/student.model');
const Contribution = require('../models/contribution.model');
const auditService = require('../services/audit.service');
const generateTransactionId = require('../utils/generateTransactionId');
const { AUDIT_MODULES, AUDIT_ACTIONS, YEARS, CONTRIBUTION_STATUS, PAYMENT_METHODS, ROLES } = require('../config/constants');
const { getPagination, buildPaginationData } = require('../utils/pagination');
const asyncHandler = require('../utils/asyncHandler');

/**
 * List all students with server-side pagination and filters
 */
const listStudents = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { search, year, section, status } = req.query;

  const filter = { isActive: true };

  if (year && Object.values(YEARS).includes(year)) {
    filter.year = year;
  }

  if (section) {
    filter.section = section.toUpperCase();
  }

  if (status && Object.values(CONTRIBUTION_STATUS).includes(status)) {
    filter.contributionStatus = status;
  }

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { name: regex },
      { rollNumber: regex },
      { registrationNumber: regex },
      { email: regex }
    ];
  }

  const [students, totalRecords] = await Promise.all([
    Student.find(filter)
      .populate('lastCollectedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Student.countDocuments(filter)
  ]);

  const pagination = buildPaginationData(totalRecords, page, limit);

  res.render('students/index', {
    title: 'Student Directory | CSE EventLedger',
    students,
    pagination,
    query: req.query,
    years: Object.values(YEARS),
    statuses: Object.values(CONTRIBUTION_STATUS),
    paymentMethods: Object.values(PAYMENT_METHODS),
    currentUser: req.user
  });
});

/**
 * Search students API (used by collection interface autocomplete)
 */
const searchStudentsAPI = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q || q.length < 1) {
    return res.json({ success: true, data: [] });
  }

  const regex = new RegExp(q, 'i');
  const students = await Student.find({
    isActive: true,
    $or: [
      { name: regex },
      { rollNumber: regex },
      { registrationNumber: regex },
      { phone: regex }
    ]
  })
    .select('name rollNumber registrationNumber department year section contributionStatus totalContributed lastCollectedByName')
    .limit(10);

  res.json({ success: true, data: students });
});

/**
 * Render create student page
 */
const renderCreateStudent = (req, res) => {
  res.render('students/create', {
    title: 'Add Student | CSE EventLedger',
    years: Object.values(YEARS),
    paymentMethods: Object.values(PAYMENT_METHODS),
    currentUser: req.user,
    error: null,
    formData: {}
  });
};

/**
 * Create a new student and optionally record their contribution right on add
 */
const createStudent = asyncHandler(async (req, res) => {
  const { name, year, amount, paymentMethod, rollNumber, registrationNumber, email, phone, department, section, notes } = req.body;

  const parsedAmount = parseFloat(amount) || 0;
  const isFirstYear = year === YEARS.FIRST || year === '1st Year' || year === '1st';

  // Check duplicate roll if explicitly provided
  if (rollNumber && rollNumber.trim()) {
    const existing = await Student.findOne({ rollNumber: rollNumber.trim().toUpperCase() });
    if (existing) {
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(400).json({ success: false, message: `Student with roll number ${rollNumber.toUpperCase()} already exists.` });
      }
      return res.status(400).render('students/create', {
        title: 'Add Student | CSE EventLedger',
        years: Object.values(YEARS),
        paymentMethods: Object.values(PAYMENT_METHODS),
        currentUser: req.user,
        error: `Student with roll number ${rollNumber.toUpperCase()} already exists.`,
        formData: req.body
      });
    }
  }

  // 1st-Year contribution guard
  if (isFirstYear && parsedAmount > 0) {
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(403).json({ success: false, message: 'First-year students are not eligible for Teachers\' Day contribution.' });
    }
    return res.status(400).render('students/create', {
      title: 'Add Student | CSE EventLedger',
      years: Object.values(YEARS),
      paymentMethods: Object.values(PAYMENT_METHODS),
      currentUser: req.user,
      error: 'First-year students are not eligible for Teachers\' Day contribution. Amount must be ₹0.',
      formData: req.body
    });
  }

  const student = new Student({
    name: name.trim(),
    year,
    rollNumber: rollNumber && rollNumber.trim() ? rollNumber.trim().toUpperCase() : undefined,
    registrationNumber: registrationNumber && registrationNumber.trim() ? registrationNumber.trim().toUpperCase() : undefined,
    email: email && email.trim() ? email.trim().toLowerCase() : undefined,
    phone: phone && phone.trim() ? phone.trim() : undefined,
    department: department || 'Department of Computer Science & Engineering',
    section: section ? section.toUpperCase() : 'A'
  });

  // If contribution amount provided on add for 2nd, 3rd, 4th year
  let contributionRecord = null;
  if (!isFirstYear && parsedAmount > 0) {
    student.totalContributed = parsedAmount;
    student.contributionStatus = CONTRIBUTION_STATUS.PAID;
    student.lastCollectedBy = req.user._id;
    student.lastCollectedByName = req.user.name;
  }

  await student.save();

  if (!isFirstYear && parsedAmount > 0) {
    const txId = generateTransactionId();
    contributionRecord = new Contribution({
      student: student._id,
      amount: parsedAmount,
      paymentMethod: paymentMethod || PAYMENT_METHODS.CASH,
      transactionReference: txId,
      collectedBy: req.user._id,
      collectedByName: req.user.name,
      notes: notes || 'Contribution recorded on student registration'
    });
    await contributionRecord.save();

    await auditService.log({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: AUDIT_ACTIONS.CREATE_CONTRIBUTION,
      module: AUDIT_MODULES.CONTRIBUTIONS,
      recordId: contributionRecord._id,
      description: `Added student ${student.name} and collected ₹${parsedAmount} (${paymentMethod || 'Cash'}). Tx: ${txId}`,
      req
    });
  } else {
    await auditService.log({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: AUDIT_ACTIONS.CREATE_STUDENT,
      module: AUDIT_MODULES.STUDENTS,
      recordId: student._id,
      description: `Added student: ${student.name} (${student.rollNumber}) [Year: ${student.year}]`,
      req
    });
  }

  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.status(201).json({
      success: true,
      message: parsedAmount > 0 ? `Student ${student.name} added & ₹${parsedAmount} collected!` : `Student ${student.name} added successfully!`,
      data: { student, contribution: contributionRecord }
    });
  }

  const successMsg = parsedAmount > 0 
    ? `Student ${student.name} added & ₹${parsedAmount} contribution recorded by ${req.user.name}!` 
    : `Student ${student.name} added to directory!`;

  res.redirect(`/students?msg=${encodeURIComponent(successMsg)}`);
});

/**
 * Show individual student profile and contribution timeline
 */
const showStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    return res.status(404).render('errors/404', { title: 'Student Not Found', message: 'Student record not found.', currentUser: req.user });
  }

  const contributions = await Contribution.find({ student: student._id, isDeleted: false })
    .populate('collectedBy', 'name email')
    .sort({ collectedAt: -1 });

  res.render('students/show', {
    title: `${student.name} | Student Details`,
    student,
    contributions,
    currentUser: req.user
  });
});

/**
 * Delete / Soft-deactivate student (SuperAdmin only)
 */
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found.' });
  }

  student.isActive = false;
  await student.save();

  await auditService.log({
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: AUDIT_ACTIONS.DELETE_STUDENT,
    module: AUDIT_MODULES.STUDENTS,
    recordId: student._id,
    description: `Deactivated student ${student.name} (${student.rollNumber})`,
    req
  });

  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.json({ success: true, message: 'Student deactivated successfully' });
  }
  res.redirect('/students?msg=Student removed');
});

module.exports = {
  listStudents,
  searchStudentsAPI,
  renderCreateStudent,
  createStudent,
  showStudent,
  deleteStudent
};
