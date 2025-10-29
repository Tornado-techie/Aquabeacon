// routes/reports.routes.js
// CREATE THIS FILE

const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validator.middleware');
const reportController = require('../controllers/report.controller');
const upload = require('../middleware/upload');

const router = express.Router();

// Validation rules for water report submission
const reportValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),
  
  body('issueType')
    .notEmpty()
    .withMessage('Issue type is required')
    .isIn(['contamination', 'shortage', 'infrastructure', 'quality', 'illegal_connection', 'leakage', 'pressure', 'other'])
    .withMessage('Invalid issue type'),
  
  body('severity')
    .notEmpty()
    .withMessage('Severity is required')
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid severity level'),
  
  body('location.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude is required'),
  
  body('location.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude is required')
];

// Routes
// All routes require authentication
router.use(authenticate);

// Submit water quality report (with photo upload)
router.post(
  '/',
  upload.array('photos', 5), // Max 5 photos
  reportValidation,
  validate,
  reportController.createReport
);

// Get all reports (for current user or all if admin/inspector)
router.get('/', reportController.getReports);

// Get single report by ID
router.get('/:id', reportController.getReportById);

// Update report (for user's own report or inspector/admin)
router.patch('/:id', reportController.updateReport);

// Delete report (only own reports)
router.delete('/:id', reportController.deleteReport);

// Get reports near a location
router.get('/nearby/:latitude/:longitude', reportController.getNearbyReports);

module.exports = router;