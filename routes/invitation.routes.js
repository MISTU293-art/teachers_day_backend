const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitation.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { invitationValidator } = require('../validators/invitation.validator');
const { validateRequest } = require('../middleware/validation.middleware');

router.use(authenticateToken);

// List invitations
router.get('/', invitationController.listInvitations);

// Create invitation form
router.get('/create', invitationController.renderCreateInvitation);
router.post('/', invitationValidator, validateRequest, invitationController.createInvitation);

// Preview and download card PDF
router.get('/:id/preview', invitationController.previewInvitation);
router.get('/:id/pdf', invitationController.downloadInvitationPDF);

// Delete invitation
router.delete('/:id', invitationController.deleteInvitation);
router.post('/:id/delete', invitationController.deleteInvitation);

module.exports = router;
