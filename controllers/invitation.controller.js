const Invitation = require('../models/invitation.model');
const auditService = require('../services/audit.service');
const pdfService = require('../services/pdf.service');
const { AUDIT_MODULES, AUDIT_ACTIONS } = require('../config/constants');
const asyncHandler = require('../utils/asyncHandler');

/**
 * List all teacher invitations
 */
const listInvitations = asyncHandler(async (req, res) => {
  const invitations = await Invitation.find()
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.render('invitations/index', {
    title: 'Teacher Directory | CSE EventLedger',
    invitations,
    query: req.query,
    currentUser: req.user
  });
});

/**
 * Render create invitation page
 */
const renderCreateInvitation = (req, res) => {
  const cseJokes = [
    'Why did the teacher bring a ladder to class? Because the students wanted to reach the next level! 😄',
    'Why do programmers prefer dark mode? Because light attracts bugs! 🐛',
    'There are 10 types of people in this world: Those who understand binary, and those who do not! 🚀',
    'Why was the JavaScript developer sad? Because they didn\'t Node how to Express themselves! 💻',
    'A teacher teaches algorithms; an exceptional teacher shows how to optimize life! ✨',
    'What did the Java developer say after class? "No more exceptions!" 😎',
    'My teacher told me to stop using Stack Overflow... but I had no other reference! 📚'
  ];

  res.render('invitations/create', {
    title: 'Add Teacher Invitation | CSE EventLedger',
    cseJokes,
    formData: {},
    error: null,
    currentUser: req.user
  });
};

/**
 * Create a new teacher invitation
 */
const createInvitation = asyncHandler(async (req, res) => {
  const { teacherName, department, designation, message, joke, eventDate, eventTime, venue, theme } = req.body;

  const invitation = new Invitation({
    teacherName,
    department: department || 'Department of Computer Science & Engineering',
    designation,
    message,
    joke,
    eventDate: eventDate || '5th September 2026',
    eventTime: eventTime || '11:00 AM - 04:00 PM',
    venue: venue || 'CSE Department Seminar Hall (Auditorium 302)',
    theme: theme || 'cyber-gold',
    createdBy: req.user._id
  });

  await invitation.save();

  await auditService.log({
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: AUDIT_ACTIONS.CREATE_INVITATION,
    module: AUDIT_MODULES.INVITATIONS,
    recordId: invitation._id,
    description: `Generated Teachers' Day invitation card for ${invitation.teacherName} (${invitation.designation})`,
    req
  });

  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.status(201).json({
      success: true,
      message: 'Invitation card generated successfully!',
      data: invitation
    });
  }

  res.redirect(`/invitations?msg=${encodeURIComponent(`Invitation for ${invitation.teacherName} created! Preview below.`)}`);
});

/**
 * Preview Invitation Card
 */
const previewInvitation = asyncHandler(async (req, res) => {
  const invitation = await Invitation.findById(req.params.id);
  if (!invitation) {
    return res.status(404).render('errors/404', { title: 'Invitation Not Found', message: 'Teacher invitation not found.', currentUser: req.user });
  }

  res.render('invitations/card-preview', {
    title: `Invitation for ${invitation.teacherName} | CSE EventLedger`,
    invitation,
    currentUser: req.user
  });
});

/**
 * Download Invitation Card PDF
 */
const downloadInvitationPDF = asyncHandler(async (req, res) => {
  const invitation = await Invitation.findById(req.params.id);
  if (!invitation) {
    return res.status(404).json({ success: false, message: 'Invitation not found.' });
  }

  const sanitizedName = invitation.teacherName.replace(/[^a-zA-Z0-9]/g, '_');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=Invitation_${sanitizedName}.pdf`);

  const pdfDoc = pdfService.generateInvitationCardPDF(invitation);
  pdfDoc.pipe(res);
});

/**
 * Delete Invitation
 */
const deleteInvitation = asyncHandler(async (req, res) => {
  const invitation = await Invitation.findByIdAndDelete(req.params.id);
  if (!invitation) {
    return res.status(404).json({ success: false, message: 'Invitation not found.' });
  }

  await auditService.log({
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: AUDIT_ACTIONS.DELETE_INVITATION,
    module: AUDIT_MODULES.INVITATIONS,
    recordId: req.params.id,
    description: `Deleted invitation card for ${invitation.teacherName}`,
    req
  });

  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.json({ success: true, message: 'Invitation card removed.' });
  }

  res.redirect('/invitations?msg=Invitation deleted');
});

module.exports = {
  listInvitations,
  renderCreateInvitation,
  createInvitation,
  previewInvitation,
  downloadInvitationPDF,
  deleteInvitation
};
