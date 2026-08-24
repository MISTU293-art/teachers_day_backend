const express = require('express');
const router = express.Router();
const multer = require('multer');
const galleryController = require('../controllers/gallery.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { ROLES } = require('../config/constants');

// Multer memory storage for direct buffer upload to ImageKit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB per image
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed!'), false);
    }
  }
});

// Admin views & operations (Auth required)
router.get('/', authenticateToken, galleryController.listGallery);
router.get('/upload', authenticateToken, galleryController.renderUploadPage);
router.post('/upload', authenticateToken, upload.array('images', 10), galleryController.uploadImages);
router.post('/:id/delete', authenticateToken, requireRole(ROLES.SUPERADMIN), galleryController.deleteImage);
router.delete('/:id', authenticateToken, requireRole(ROLES.SUPERADMIN), galleryController.deleteImage);

module.exports = router;
