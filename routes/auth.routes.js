const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { loginValidator } = require('../validators/auth.validator');
const { validateRequest } = require('../middleware/validation.middleware');
const { loginLimiter } = require('../middleware/rateLimit.middleware');
const { optionalAuth } = require('../middleware/auth.middleware');

router.get('/login', optionalAuth, authController.renderLogin);
router.post('/login', loginLimiter, loginValidator, validateRequest, authController.login);
router.get('/logout', authController.logout);
router.post('/logout', authController.logout);

module.exports = router;
