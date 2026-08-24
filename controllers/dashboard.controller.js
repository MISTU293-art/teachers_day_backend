const Student = require('../models/student.model');
const Contribution = require('../models/contribution.model');
const Expense = require('../models/expense.model');
const Invitation = require('../models/invitation.model');
const User = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES, YEARS, CONTRIBUTION_STATUS, EXPENSE_STATUS } = require('../config/constants');

/**
 * Render Main Dashboard (Role-tailored for SuperAdmin & Admin)
 */
const renderDashboard = asyncHandler(async (req, res) => {
  const isSuperAdmin = req.user.role === ROLES.SUPERADMIN;

  // Aggregate Total Collections
  const collectionAgg = await Contribution.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
  ]);
  const totalCollected = collectionAgg[0]?.total || 0;
  const totalTransactions = collectionAgg[0]?.count || 0;

  // Aggregate Expenses
  const expenseAgg = await Expense.aggregate([
    {
      $group: {
        _id: '$status',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  let totalApprovedExpenses = 0;
  let totalPendingExpenses = 0;
  let approvedExpensesCount = 0;
  let pendingExpensesCount = 0;

  expenseAgg.forEach(item => {
    if (item._id === EXPENSE_STATUS.APPROVED) {
      totalApprovedExpenses = item.total;
      approvedExpensesCount = item.count;
    } else if (item._id === EXPENSE_STATUS.PENDING) {
      totalPendingExpenses = item.total;
      pendingExpensesCount = item.count;
    }
  });

  // Financial Balance Formula: Collections - Approved Expenses
  const remainingBalance = totalCollected - totalApprovedExpenses;

  // Student Statistics
  const totalStudents = await Student.countDocuments();
  const firstYearStudents = await Student.countDocuments({ year: YEARS.FIRST });
  const eligibleStudents = totalStudents - firstYearStudents;
  const paidStudents = await Student.countDocuments({
    contributionStatus: { $in: [CONTRIBUTION_STATUS.PAID, CONTRIBUTION_STATUS.PARTIALLY_PAID] }
  });
  const pendingStudents = await Student.countDocuments({
    contributionStatus: CONTRIBUTION_STATUS.PENDING,
    year: { $ne: YEARS.FIRST }
  });

  // Admin Specific Statistics (If logged in as Admin)
  let myCollectionsTotal = 0;
  let myTransactionsCount = 0;
  if (!isSuperAdmin) {
    const myCollectionAgg = await Contribution.aggregate([
      { $match: { collectedBy: req.user._id, isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    myCollectionsTotal = myCollectionAgg[0]?.total || 0;
    myTransactionsCount = myCollectionAgg[0]?.count || 0;
  }

  // Admins, Invitations, Programs, Gallery, and Participations counts
  const [totalAdmins, totalInvitations, totalPrograms, totalGalleryPhotos, totalParticipations] = await Promise.all([
    User.countDocuments({ role: ROLES.ADMIN, isActive: true }),
    Invitation.countDocuments(),
    require('../models/program.model').countDocuments(),
    require('../models/gallery.model').countDocuments(),
    require('../models/participation.model').countDocuments()
  ]);

  // Recent Collections Feed (last 6)
  const recentCollections = await Contribution.find({ isDeleted: false })
    .populate('student', 'name rollNumber year department')
    .sort({ createdAt: -1 })
    .limit(6);

  // Recent Expenses Feed (last 5)
  const recentExpenses = await Expense.find()
    .populate('addedBy', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  res.render(isSuperAdmin ? 'dashboard/superadmin' : 'dashboard/admin', {
    title: 'Dashboard | CSE EventLedger',
    currentUser: req.user,
    stats: {
      totalCollected,
      totalApprovedExpenses,
      totalPendingExpenses,
      remainingBalance,
      totalStudents,
      eligibleStudents,
      firstYearStudents,
      paidStudents,
      pendingStudents,
      totalTransactions,
      totalAdmins,
      totalInvitations,
      totalPrograms,
      totalGalleryPhotos,
      totalParticipations,
      approvedExpensesCount,
      pendingExpensesCount,
      myCollectionsTotal,
      myTransactionsCount
    },
    recentCollections,
    recentExpenses
  });
});

/**
 * Analytics API for Chart.js
 */
const getAnalytics = asyncHandler(async (req, res) => {
  // 1. Collection by Year (2nd, 3rd, 4th)
  const yearWiseCollections = await Contribution.aggregate([
    { $match: { isDeleted: false } },
    {
      $lookup: {
        from: 'students',
        localField: 'student',
        foreignField: '_id',
        as: 'studentDoc'
      }
    },
    { $unwind: '$studentDoc' },
    {
      $group: {
        _id: '$studentDoc.year',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // 2. Collection by Payment Method (Cash vs UPI vs Bank Transfer)
  const paymentMethodCollections = await Contribution.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$paymentMethod',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  // 3. Approved Expenses by Category
  const expenseByCategory = await Expense.aggregate([
    { $match: { status: EXPENSE_STATUS.APPROVED } },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);

  // 4. Collector Leaderboard
  const collectorLeaderboard = await Contribution.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$collectedByName',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { totalAmount: -1 } },
    { $limit: 5 }
  ]);

  res.json({
    success: true,
    data: {
      yearWiseCollections,
      paymentMethodCollections,
      expenseByCategory,
      collectorLeaderboard
    }
  });
});

module.exports = {
  renderDashboard,
  getAnalytics
};
