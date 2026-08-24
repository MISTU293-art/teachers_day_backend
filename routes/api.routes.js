const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/gallery.controller');
const participationController = require('../controllers/participation.controller');
const Student = require('../models/student.model');
const Invitation = require('../models/invitation.model');
const Gallery = require('../models/gallery.model');
const Participation = require('../models/participation.model');
const asyncHandler = require('../utils/asyncHandler');

// Public Gallery API
router.get('/gallery', galleryController.getPublicGalleryAPI);

// Public Participation Form Submission
router.post('/participate', participationController.submitParticipationAPI);

// Public Event Stats / Metadata for React Homepage
router.get('/event-info', asyncHandler(async (req, res) => {
  const [photoCount, participantCount, teacherCount] = await Promise.all([
    Gallery.countDocuments({ isPublic: true }),
    Participation.countDocuments(),
    Invitation.countDocuments()
  ]);

  res.json({
    success: true,
    data: {
      eventTitle: "Teachers' Day Celebration 2026",
      eventDate: "September 3, 2026",
      eventTime: "10:30 AM onwards",
      venue: "CSE Department Main Auditorium (Hall 302)",
      department: "Department of Computer Science & Engineering",
      tagline: "Celebrating the architects of our code and mentors of our lives.",
      counts: {
        photos: photoCount,
        performers: participantCount,
        honoredTeachers: teacherCount
      }
    }
  });
}));

module.exports = router;
