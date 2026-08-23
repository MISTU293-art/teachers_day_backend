const User = require('../models/user.model');
const Contribution = require('../models/contribution.model');
const Expense = require('../models/expense.model');
const auditService = require('../services/audit.service');
const { AUDIT_MODULES, AUDIT_ACTIONS, ROLES } = require('../config/constants');
const asyncHandler = require('../utils/asyncHandler');

/**
 * SuperAdmin: List all Administrators with their operational stats
 */
const listAdmins = asyncHandler(async (req, res) => {
  const admins = await User.find({ role: { $in: [ROLES.ADMIN, ROLES.SUPERADMIN] } })
    .select('-password')
    .sort({ role: 1, createdAt: -1 });

  // Gather activity stats for each admin
  const adminStatsPromises = admins.map(async (admin) => {
    const [collectionAgg, expenseCount] = await Promise.all([
      Contribution.aggregate([
        { $match: { collectedBy: admin._id, isDeleted: false } },
        { $group: { _id: null, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Expense.countDocuments({ addedBy: admin._id })
    ]);

    return {
      adminId: admin._id.toString(),
      totalCollected: collectionAgg[0]?.totalAmount || 0,
      contributionsCount: collectionAgg[0]?.count || 0,
      expensesCount: expenseCount
    };
  });

  const statsResults = await Promise.all(adminStatsPromises);
  const statsMap = {};
  statsResults.forEach(s => {
    statsMap[s.adminId] = s;
  });

  res.render('admins/index', {
    title: 'Administrator Management | SuperAdmin Portal',
    admins,
    statsMap,
    currentUser: req.user
  });
});

/**
 * SuperAdmin: Create a new Administrator
 */
const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, department, phone } = req.body;

  const normalizedEmail = email.toLowerCase().trim();

  // Check if email is already taken
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(400).json({ success: false, message: 'An administrator with this email address already exists.' });
    }
    return res.status(400).render('admins/create', {
      title: 'Add Administrator | SuperAdmin Portal',
      error: 'An administrator with this email address already exists.',
      formData: req.body,
      currentUser: req.user
    });
  }

  // Security enforcement: Explicitly force role to 'admin' (NEVER allow client to elevate to superadmin)
  const newAdmin = new User({
    name,
    email: normalizedEmail,
    password, // Handled by pre-save bcrypt hook
    role: ROLES.ADMIN,
    department: department || 'Computer Science & Engineering',
    phone: phone || '',
    isActive: true
  });

  await newAdmin.save();

  await auditService.log({
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: AUDIT_ACTIONS.CREATE_ADMIN,
    module: AUDIT_MODULES.ADMINS,
    recordId: newAdmin._id,
    description: `SuperAdmin ${req.user.name} created new Admin account for ${newAdmin.name} (${newAdmin.email})`,
    req
  });

  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.status(201).json({
      success: true,
      message: `Admin account for ${newAdmin.name} created successfully!`,
      data: { id: newAdmin._id, name: newAdmin.name, email: newAdmin.email }
    });
  }

  res.redirect('/admins?msg=Admin created successfully');
});

/**
 * SuperAdmin: Toggle Admin Active/Disabled Status
 */
const toggleAdminStatus = asyncHandler(async (req, res) => {
  const admin = await User.findById(req.params.id);
  if (!admin) {
    return res.status(404).json({ success: false, message: 'Administrator account not found.' });
  }

  if (admin.role === ROLES.SUPERADMIN) {
    return res.status(403).json({ success: false, message: 'Cannot disable the primary SuperAdmin account.' });
  }

  admin.isActive = !admin.isActive;
  await admin.save();

  const action = admin.isActive ? AUDIT_ACTIONS.ENABLE_ADMIN : AUDIT_ACTIONS.DISABLE_ADMIN;
  await auditService.log({
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action,
    module: AUDIT_MODULES.ADMINS,
    recordId: admin._id,
    description: `SuperAdmin ${req.user.name} ${admin.isActive ? 'activated' : 'disabled'} admin account for ${admin.name}`,
    req
  });

  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.json({
      success: true,
      message: `Admin account for ${admin.name} is now ${admin.isActive ? 'active' : 'disabled'}.`,
      isActive: admin.isActive
    });
  }

  res.redirect('/admins?msg=Status updated');
});

/**
 * SuperAdmin: Reset Admin Password
 */
const resetAdminPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  const admin = await User.findById(req.params.id);

  if (!admin) {
    return res.status(404).json({ success: false, message: 'Administrator account not found.' });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }

  admin.password = newPassword; // Will trigger pre-save bcrypt hash
  await admin.save();

  await auditService.log({
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: AUDIT_ACTIONS.RESET_PASSWORD,
    module: AUDIT_MODULES.ADMINS,
    recordId: admin._id,
    description: `SuperAdmin ${req.user.name} reset the password for admin ${admin.name} (${admin.email})`,
    req
  });

  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.json({ success: true, message: `Password for ${admin.name} reset successfully.` });
  }

  res.redirect('/admins?msg=Password reset successfully');
});

module.exports = {
  listAdmins,
  createAdmin,
  toggleAdminStatus,
  resetAdminPassword
};
