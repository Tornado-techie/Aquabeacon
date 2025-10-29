// Fixed reports.routes.js with proper middleware order

const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { roleGuard } = require('../middleware/roleGuard.middleware');
const { uploadArray, validateFiles } = require('../middleware/upload.middleware');
const { validateReportData } = require('../middleware/validator.middleware');
const reportController = require('../controllers/report.controller');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Submit water quality report with enhanced file upload
// Order: auth → upload → file validation → data validation → controller
router.post(
  '/',
  uploadArray('photos', 5),             // File upload processing (max 5 photos)
  validateFiles({                       // File validation after multer
    required: false,                    // Photos are optional for reports
    minFiles: 0,
    maxFiles: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
  }),
  validateReportData,                   // Data validation
  reportController.createReport         // Controller
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

// Update report status (admin/inspector only)
router.patch(
  '/:id/status', 
  roleGuard(['admin', 'inspector']),
  reportController.updateReportStatus
);

module.exports = router;