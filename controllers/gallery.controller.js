const Gallery = require('../models/gallery.model');
const imagekitService = require('../services/imagekit.service');
const auditService = require('../services/audit.service');
const { AUDIT_MODULES, AUDIT_ACTIONS, ROLES } = require('../config/constants');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, buildPaginationData } = require('../utils/pagination');

/**
 * List gallery images in admin portal
 */
const listGallery = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 24);

  const [images, totalRecords] = await Promise.all([
    Gallery.find()
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Gallery.countDocuments()
  ]);

  const pagination = buildPaginationData(totalRecords, page, limit);

  res.render('gallery/index', {
    title: 'Event Gallery | CSE EventLedger',
    images,
    pagination,
    currentUser: req.user,
    query: req.query
  });
});

/**
 * Render upload page
 */
const renderUploadPage = (req, res) => {
  res.render('gallery/upload', {
    title: 'Upload Event Photos | CSE EventLedger',
    currentUser: req.user,
    error: null
  });
};

/**
 * Handle image upload (Admin/SuperAdmin)
 */
const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(400).json({ success: false, message: 'Please select at least one image to upload.' });
    }
    return res.status(400).render('gallery/upload', {
      title: 'Upload Event Photos | CSE EventLedger',
      currentUser: req.user,
      error: 'Please select at least one image to upload.'
    });
  }

  const { title, description, tags, isPublic } = req.body;
  const parsedTags = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  const uploadedResults = [];

  for (const file of req.files) {
    try {
      const uploadRes = await imagekitService.uploadImage(
        file.buffer,
        `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      );

      const galleryItem = new Gallery({
        title: title ? title.trim() : file.originalname,
        description: description ? description.trim() : '',
        imageUrl: uploadRes.url,
        thumbnailUrl: uploadRes.thumbnailUrl,
        fileId: uploadRes.fileId,
        uploadedBy: req.user._id,
        isPublic: isPublic !== 'false',
        tags: parsedTags
      });

      await galleryItem.save();
      uploadedResults.push(galleryItem);

      await auditService.log({
        user: req.user._id,
        userName: req.user.name,
        userRole: req.user.role,
        action: AUDIT_ACTIONS.UPLOAD_IMAGE,
        module: AUDIT_MODULES.GALLERY,
        recordId: galleryItem._id,
        description: `Uploaded photo to gallery: ${galleryItem.title} (${uploadRes.fileId})`,
        req
      });
    } catch (err) {
      console.error('ImageKit upload error for file:', file.originalname, err);
      if (uploadedResults.length === 0) {
        if (req.xhr || req.headers.accept?.includes('json')) {
          return res.status(500).json({ success: false, message: `Upload failed: ${err.message}` });
        }
        return res.status(500).render('gallery/upload', {
          title: 'Upload Event Photos | CSE EventLedger',
          currentUser: req.user,
          error: `Upload failed: ${err.message}. Please verify ImageKit credentials in .env`
        });
      }
    }
  }

  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.status(201).json({
      success: true,
      message: `Successfully uploaded ${uploadedResults.length} image(s).`,
      data: uploadedResults
    });
  }

  res.redirect(`/gallery?msg=${encodeURIComponent(`Successfully uploaded ${uploadedResults.length} image(s).`)}`);
});

/**
 * Delete image from gallery & ImageKit
 */
const deleteImage = asyncHandler(async (req, res) => {
  const image = await Gallery.findById(req.params.id);
  if (!image) {
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(404).json({ success: false, message: 'Image not found.' });
    }
    return res.status(404).redirect('/gallery?error=Image not found');
  }

  try {
    await imagekitService.deleteImage(image.fileId);
  } catch (err) {
    console.warn(`[ImageKit Warning] Could not delete file ${image.fileId} from ImageKit:`, err.message);
  }

  await Gallery.findByIdAndDelete(req.params.id);

  await auditService.log({
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: AUDIT_ACTIONS.DELETE_IMAGE,
    module: AUDIT_MODULES.GALLERY,
    recordId: image._id,
    description: `Deleted photo from gallery: ${image.title} (${image.fileId})`,
    req
  });

  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.json({ success: true, message: 'Image deleted successfully.' });
  }

  res.redirect('/gallery?msg=Image deleted successfully');
});

/**
 * Public API for React frontend to fetch gallery photos
 */
const getPublicGalleryAPI = asyncHandler(async (req, res) => {
  const images = await Gallery.find({ isPublic: true })
    .populate('uploadedBy', 'name role')
    .sort({ createdAt: -1 })
    .limit(100);

  res.json({
    success: true,
    count: images.length,
    data: images
  });
});

module.exports = {
  listGallery,
  renderUploadPage,
  uploadImages,
  deleteImage,
  getPublicGalleryAPI
};
