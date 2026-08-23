const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { studentValidator } = require('../validators/student.validator');
const { validateRequest } = require('../middleware/validation.middleware');
const { ROLES } = require('../config/constants');

router.use(authenticateToken);

// Live autocomplete API available to all authenticated admins/volunteers
router.get('/api/search', studentController.searchStudentsAPI);

// List students
router.get('/', studentController.listStudents);

// SuperAdmin only: Create student
router.get('/create', studentController.renderCreateStudent);
router.post('/', studentValidator, validateRequest, studentController.createStudent);

// // Student profile
router.get('/:id', studentController.showStudent);

// SuperAdmin only: Delete / Deactivate student
router.delete('/:id', studentController.deleteStudent);
router.post('/:id/delete', studentController.deleteStudent);

module.exports = router;
