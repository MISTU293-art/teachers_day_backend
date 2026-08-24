const Program = require('../models/program.model');
const auditService = require('../services/audit.service');
const { AUDIT_MODULES, AUDIT_ACTIONS, PROGRAM_CATEGORIES, PROGRAM_STATUS, REGISTRATION_STATUS } = require('../config/constants');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, buildPaginationData } = require('../utils/pagination');

/**
 * Admin portal: List all department programs and schedules
 */
const listPrograms = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 20);
  const { category, status, search } = req.query;

  const filter = {};

  if (category && PROGRAM_CATEGORIES.includes(category)) {
    filter.category = category;
  }

  if (status && Object.values(PROGRAM_STATUS).includes(status)) {
    filter.status = status;
  }

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { title: regex },
      { venue: regex },
      { shortDescription: regex },
      { tags: regex }
    ];
  }

  const [programs, totalRecords, counts] = await Promise.all([
    Program.find(filter)
      .populate('createdBy', 'name email role')
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Program.countDocuments(filter),
    Promise.all([
      Program.countDocuments(),
      Program.countDocuments({ status: PROGRAM_STATUS.UPCOMING }),
      Program.countDocuments({ status: PROGRAM_STATUS.COMPLETED })
    ])
  ]);

  const pagination = buildPaginationData(totalRecords, page, limit);

  res.render('programs/index', {
    title: 'Department Programs & Events | CSE EventLedger',
    programs,
    pagination,
    query: req.query,
    categories: PROGRAM_CATEGORIES,
    statuses: Object.values(PROGRAM_STATUS),
    counts: {
      total: counts[0],
      upcoming: counts[1],
      completed: counts[2]
    },
    currentUser: req.user
  });
});

/**
 * Render create program form
 */
const renderCreateProgram = (req, res) => {
  res.render('programs/create', {
    title: 'Schedule New Program | CSE EventLedger',
    categories: PROGRAM_CATEGORIES,
    statuses: Object.values(PROGRAM_STATUS),
    regStatuses: Object.values(REGISTRATION_STATUS),
    currentUser: req.user,
    error: null,
    formData: {}
  });
};

/**
 * Helper to parse agenda items from form inputs
 */
const parseAgendaItems = (body) => {
  const agenda = [];
  if (Array.isArray(body.agendaTime)) {
    for (let i = 0; i < body.agendaTime.length; i++) {
      if (body.agendaTime[i] && body.agendaActivity[i]) {
        agenda.push({
          time: body.agendaTime[i].trim(),
          activity: body.agendaActivity[i].trim(),
          speakerOrPerformer: (body.agendaSpeaker && body.agendaSpeaker[i]) ? body.agendaSpeaker[i].trim() : '',
          location: (body.agendaLocation && body.agendaLocation[i]) ? body.agendaLocation[i].trim() : ''
        });
      }
    }
  } else if (body.agendaTime && body.agendaActivity) {
    agenda.push({
      time: body.agendaTime.trim(),
      activity: body.agendaActivity.trim(),
      speakerOrPerformer: body.agendaSpeaker ? body.agendaSpeaker.trim() : '',
      location: body.agendaLocation ? body.agendaLocation.trim() : ''
    });
  }
  return agenda;
};

/**
 * Create a new program schedule (Admin / SuperAdmin)
 */
const createProgram = asyncHandler(async (req, res) => {
  const {
    title,
    category,
    eventDate,
    eventTime,
    venue,
    shortDescription,
    description,
    status,
    isFeatured,
    registrationStatus,
    registrationLink,
    tags,
    posterUrl
  } = req.body;

  if (!title || !eventDate || !eventTime || !venue) {
    return res.status(400).render('programs/create', {
      title: 'Schedule New Program | CSE EventLedger',
      categories: PROGRAM_CATEGORIES,
      statuses: Object.values(PROGRAM_STATUS),
      regStatuses: Object.values(REGISTRATION_STATUS),
      currentUser: req.user,
      error: 'Please fill in all required fields: Title, Event Date, Event Time, and Venue.',
      formData: req.body
    });
  }

  const parsedTags = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  const agenda = parseAgendaItems(req.body);

  const isFeaturedBool = isFeatured === 'true' || isFeatured === true || isFeatured === 'on';

  // If this program is marked featured, unset others
  if (isFeaturedBool) {
    await Program.updateMany({}, { isFeatured: false });
  }

  const program = new Program({
    title: title.trim(),
    category: category || 'Celebration',
    eventDate: eventDate.trim(),
    eventTime: eventTime.trim(),
    venue: venue.trim(),
    shortDescription: shortDescription ? shortDescription.trim() : '',
    description: description ? description.trim() : '',
    status: status || PROGRAM_STATUS.UPCOMING,
    isFeatured: isFeaturedBool,
    registrationStatus: registrationStatus || REGISTRATION_STATUS.OPEN,
    registrationLink: registrationLink ? registrationLink.trim() : '',
    tags: parsedTags,
    posterUrl: posterUrl ? posterUrl.trim() : '',
    agenda,
    createdBy: req.user._id
  });

  await program.save();

  await auditService.log({
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: AUDIT_ACTIONS.CREATE_PROGRAM,
    module: AUDIT_MODULES.PROGRAMS,
    recordId: program._id,
    description: `Scheduled new CSE department program: ${program.title} on ${program.eventDate}`,
    req
  });

  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.status(201).json({
      success: true,
      message: `Program "${program.title}" scheduled successfully!`,
      data: program
    });
  }

  res.redirect(`/programs?msg=${encodeURIComponent(`Program "${program.title}" scheduled successfully!`)}`);
});

/**
 * Render edit program form
 */
const renderEditProgram = asyncHandler(async (req, res) => {
  const program = await Program.findById(req.params.id);
  if (!program) {
    return res.status(404).redirect('/programs?error=Program not found');
  }

  res.render('programs/edit', {
    title: `Edit ${program.title} | CSE EventLedger`,
    program,
    categories: PROGRAM_CATEGORIES,
    statuses: Object.values(PROGRAM_STATUS),
    regStatuses: Object.values(REGISTRATION_STATUS),
    currentUser: req.user,
    error: null
  });
});

/**
 * Update program schedule
 */
const updateProgram = asyncHandler(async (req, res) => {
  const program = await Program.findById(req.params.id);
  if (!program) {
    return res.status(404).redirect('/programs?error=Program not found');
  }

  const {
    title,
    category,
    eventDate,
    eventTime,
    venue,
    shortDescription,
    description,
    status,
    isFeatured,
    registrationStatus,
    registrationLink,
    tags,
    posterUrl
  } = req.body;

  const isFeaturedBool = isFeatured === 'true' || isFeatured === true || isFeatured === 'on';

  if (isFeaturedBool && !program.isFeatured) {
    await Program.updateMany({}, { isFeatured: false });
  }

  program.title = title.trim();
  program.category = category;
  program.eventDate = eventDate.trim();
  program.eventTime = eventTime.trim();
  program.venue = venue.trim();
  program.shortDescription = shortDescription ? shortDescription.trim() : '';
  program.description = description ? description.trim() : '';
  program.status = status;
  program.isFeatured = isFeaturedBool;
  program.registrationStatus = registrationStatus;
  program.registrationLink = registrationLink ? registrationLink.trim() : '';
  program.posterUrl = posterUrl ? posterUrl.trim() : '';
  program.tags = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  const agenda = parseAgendaItems(req.body);
  if (agenda.length > 0) {
    program.agenda = agenda;
  }

  await program.save();

  await auditService.log({
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: AUDIT_ACTIONS.UPDATE_PROGRAM,
    module: AUDIT_MODULES.PROGRAMS,
    recordId: program._id,
    description: `Updated CSE program: ${program.title}`,
    req
  });

  res.redirect(`/programs?msg=${encodeURIComponent(`Program "${program.title}" updated successfully!`)}`);
});

/**
 * Delete program (SuperAdmin only)
 */
const deleteProgram = asyncHandler(async (req, res) => {
  const program = await Program.findByIdAndDelete(req.params.id);
  if (!program) {
    return res.status(404).redirect('/programs?error=Program not found');
  }

  await auditService.log({
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: AUDIT_ACTIONS.DELETE_PROGRAM,
    module: AUDIT_MODULES.PROGRAMS,
    recordId: req.params.id,
    description: `Deleted CSE program: ${program.title}`,
    req
  });

  res.redirect('/programs?msg=Program deleted successfully');
});

/**
 * Public API: Get all department programs for React frontend
 */
const getPublicProgramsAPI = asyncHandler(async (req, res) => {
  const { category, status } = req.query;
  const filter = {};

  if (category && category !== 'All') {
    filter.category = category;
  }

  if (status && status !== 'All') {
    filter.status = status;
  }

  const programs = await Program.find(filter)
    .sort({ isFeatured: -1, createdAt: -1 });

  res.json({
    success: true,
    count: programs.length,
    data: programs
  });
});

/**
 * Public API: Get featured program
 */
const getFeaturedProgramAPI = asyncHandler(async (req, res) => {
  let featured = await Program.findOne({ isFeatured: true });
  
  // If none explicitly flagged featured, return the most recent upcoming event
  if (!featured) {
    featured = await Program.findOne({ status: PROGRAM_STATUS.UPCOMING }).sort({ createdAt: -1 });
  }

  // Fallback to most recent
  if (!featured) {
    featured = await Program.findOne().sort({ createdAt: -1 });
  }

  res.json({
    success: true,
    data: featured
  });
});

module.exports = {
  listPrograms,
  renderCreateProgram,
  createProgram,
  renderEditProgram,
  updateProgram,
  deleteProgram,
  getPublicProgramsAPI,
  getFeaturedProgramAPI
};
