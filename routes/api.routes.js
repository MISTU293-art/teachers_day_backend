const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/gallery.controller');
const participationController = require('../controllers/participation.controller');
const programController = require('../controllers/program.controller');
const Program = require('../models/program.model');
const Gallery = require('../models/gallery.model');
const Participation = require('../models/participation.model');
const Invitation = require('../models/invitation.model');
const asyncHandler = require('../utils/asyncHandler');

// Public Program / Schedule APIs for React Frontend
router.get('/programs', programController.getPublicProgramsAPI);
router.get('/programs/featured', programController.getFeaturedProgramAPI);

// Public Gallery API
router.get('/gallery', galleryController.getPublicGalleryAPI);

// Public Participation Form Submission
router.post('/participate', participationController.submitParticipationAPI);

// Public Department Overview Stats / Metadata for React Homepage
router.get('/event-info', asyncHandler(async (req, res) => {
  const [photoCount, participantCount, programCount, featuredProgram] = await Promise.all([
    Gallery.countDocuments({ isPublic: true }),
    Participation.countDocuments(),
    Program.countDocuments(),
    Program.findOne({ isFeatured: true })
  ]);

  res.json({
    success: true,
    data: {
      portalTitle: "Department of Computer Science & Engineering",
      subtitle: "Official Event & Program Hub",
      department: "Computer Science & Engineering",
      featuredEvent: featuredProgram ? {
        title: featuredProgram.title,
        date: featuredProgram.eventDate,
        time: featuredProgram.eventTime,
        venue: featuredProgram.venue,
        category: featuredProgram.category
      } : {
        title: "Teachers' Day Celebration 2026",
        date: "3rd September 2026",
        time: "10:30 AM onwards",
        venue: "CSE Department Main Auditorium (Hall 302)",
        category: "Celebration"
      },
      counts: {
        photos: photoCount,
        performers: participantCount,
        programs: programCount
      }
    }
  });
}));

module.exports = router;
