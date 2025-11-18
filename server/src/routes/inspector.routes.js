const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { roleGuard } = require('../middleware/roleGuard.middleware');
const inspectorController = require('../controllers/inspector.controller');

const router = express.Router();

// All routes require authentication and inspector/admin role
router.use(authenticate);
router.use(roleGuard(['inspector', 'admin']));

/**
 * @route   GET /api/inspector/complaints
 * @desc    Get all complaints for inspector dashboard
 * @access  Private (Inspector/Admin only)
 */
router.get('/complaints', inspectorController.getComplaintsForInspector);

/**
 * @route   PUT /api/inspector/complaints/:id/assign
 * @desc    Assign complaint to inspector
 * @access  Private (Inspector/Admin only)
 */
router.put('/complaints/:id/assign', inspectorController.assignComplaint);

/**
 * @route   PUT /api/inspector/complaints/:id/status
 * @desc    Update complaint status
 * @access  Private (Inspector/Admin only)
 */
router.put('/complaints/:id/status', inspectorController.updateComplaintStatus);

/**
 * @route   POST /api/inspector/complaints/:id/schedule-visit
 * @desc    Schedule visit to facility
 * @access  Private (Inspector/Admin only)
 */
router.post('/complaints/:id/schedule-visit', inspectorController.scheduleVisit);

/**
 * @route   POST /api/inspector/complaints/:id/send-email
 * @desc    Send email to company
 * @access  Private (Inspector/Admin only)
 */
router.post('/complaints/:id/send-email', inspectorController.sendEmailToCompany);

/**
 * @route   POST /api/inspector/complaints/:id/visit-report
 * @desc    Add visit report
 * @access  Private (Inspector/Admin only)
 */
router.post('/complaints/:id/visit-report', inspectorController.addVisitReport);

/**
 * @route   GET /api/inspector/stats
 * @desc    Get inspector statistics
 * @access  Private (Inspector/Admin only)
 */
router.get('/stats', inspectorController.getInspectorStats);

/**
 * @route   GET /api/inspector/inspectors
 * @desc    Get available inspectors
 * @access  Private (Inspector/Admin only)
 */
router.get('/inspectors', inspectorController.getInspectors);

module.exports = router;