const Participation = require('../models/participation.model');
const auditService = require('../services/audit.service');
const { AUDIT_MODULES, AUDIT_ACTIONS, YEARS, PERFORMANCE_TYPES } = require('../config/constants');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, buildPaginationData } = require('../utils/pagination');

/**
 * Public API: Submit Participation Form from React Frontend (No login needed)
 */
const submitParticipationAPI = asyncHandler(async (req, res) => {
  const { name, contact, year, performance, performanceDetails, teamMembers } = req.body;

  if (!name || !contact || !year || !performance) {
    return res.status(400).json({
      success: false,
      message: 'Name, contact, academic year, and performance type are required.'
    });
  }

  const newParticipation = new Participation({
    name: name.trim(),
    contact: contact.trim(),
    year,
    performance,
    performanceDetails: performanceDetails ? performanceDetails.trim() : '',
    teamMembers: teamMembers ? teamMembers.trim() : ''
  });

  await newParticipation.save();

  res.status(201).json({
    success: true,
    message: 'Performance registration submitted successfully! Our event coordinators will reach out soon.',
    data: newParticipation
  });
});

/**
 * Admin portal: List all participation submissions
 */
const listParticipations = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 20);
  const { year, performance, reviewed, search } = req.query;

  const filter = {};

  if (year && Object.values(YEARS).includes(year)) {
    filter.year = year;
  }

  if (performance && PERFORMANCE_TYPES.includes(performance)) {
    filter.performance = performance;
  }

  if (reviewed === 'true') {
    filter.isReviewed = true;
  } else if (reviewed === 'false') {
    filter.isReviewed = false;
  }

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { name: regex },
      { contact: regex },
      { performanceDetails: regex },
      { teamMembers: regex }
    ];
  }

  const [participations, totalRecords, counts] = await Promise.all([
    Participation.find(filter)
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Participation.countDocuments(filter),
    Promise.all([
      Participation.countDocuments(),
      Participation.countDocuments({ isReviewed: false }),
      Participation.countDocuments({ isReviewed: true })
    ])
  ]);

  const pagination = buildPaginationData(totalRecords, page, limit);

  res.render('participations/index', {
    title: 'Student Performance Registrations | CSE EventLedger',
    participations,
    pagination,
    query: req.query,
    years: Object.values(YEARS),
    performanceTypes: PERFORMANCE_TYPES,
    counts: {
      total: counts[0],
      pending: counts[1],
      reviewed: counts[2]
    },
    currentUser: req.user
  });
});

/**
 * Toggle / update review status for a participation submission
 */
const toggleReview = asyncHandler(async (req, res) => {
  const { reviewNotes } = req.body;
  const participation = await Participation.findById(req.params.id);

  if (!participation) {
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }
    return res.status(404).redirect('/participations?error=Registration not found');
  }

  participation.isReviewed = !participation.isReviewed;
  if (participation.isReviewed) {
    participation.reviewedBy = req.user._id;
    if (reviewNotes) participation.reviewNotes = reviewNotes.trim();
  } else {
    participation.reviewedBy = undefined;
  }

  await participation.save();

  await auditService.log({
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: AUDIT_ACTIONS.REVIEW_PARTICIPATION,
    module: AUDIT_MODULES.PARTICIPATIONS,
    recordId: participation._id,
    description: `Marked registration of ${participation.name} (${participation.performance}) as ${participation.isReviewed ? 'Reviewed' : 'Pending'}`,
    req
  });

  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.json({
      success: true,
      message: `Registration marked as ${participation.isReviewed ? 'Reviewed' : 'Pending'}.`,
      data: participation
    });
  }

  res.redirect(`/participations?msg=${encodeURIComponent(`Registration status updated for ${participation.name}.`)}`);
});

/**
 * Delete a participation submission (SuperAdmin only)
 */
const deleteParticipation = asyncHandler(async (req, res) => {
  const participation = await Participation.findByIdAndDelete(req.params.id);

  if (!participation) {
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }
    return res.status(404).redirect('/participations?error=Registration not found');
  }

  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.json({ success: true, message: 'Registration deleted successfully.' });
  }

  res.redirect('/participations?msg=Registration deleted successfully');
});

module.exports = {
  submitParticipationAPI,
  listParticipations,
  toggleReview,
  deleteParticipation
};
