// Fixed complaints.routes.js with proper middleware order

const express = require('express');
const { authenticate, optionalAuthenticate } = require('../middleware/auth.middleware');
const { roleGuard } = require('../middleware/roleGuard.middleware');
const { uploadArray, validateFiles } = require('../middleware/upload.middleware');
const { validateComplaintData } = require('../middleware/validator.middleware');
const complaintsController = require('../controllers/complaints.controller');
const Complaint = require('../models/Complaint');
const logger = require('../utils/logger');

const complaintsRouter = express.Router();

// FIXED: Complaint submission route with proper middleware order
// Order: optional auth → upload → file validation → data validation → controller
complaintsRouter.post(
  '/',
  optionalAuthenticate,                  // 1. Optional Authentication (allows anonymous complaints)
  uploadArray('photos', 5),              // 2. File upload processing (multer)
  validateFiles({                        // 3. File validation (after multer)
    required: false,                     // Photos are optional for complaints
    minFiles: 0,
    maxFiles: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
  }),
  validateComplaintData,                 // 4. Data validation
  complaintsController.submitComplaint   // 5. Controller
);

// Alternative endpoint for anonymous complaints (no auth required)
complaintsRouter.post(
  '/anonymous',
  optionalAuthenticate,                  // Optional auth
  uploadArray('photos', 5),              // File upload
  validateFiles({                        // File validation
    required: false,
    minFiles: 0,
    maxFiles: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
  }),
  validateComplaintData,                 // Data validation
  complaintsController.submitComplaint   // Controller
);

// Track complaint without authentication (using phone + complaint ID)
complaintsRouter.post(
  '/track',
  async (req, res) => {
    try {
      const { phone, complaintId } = req.body;

      if (!phone || !complaintId) {
        return res.status(400).json({
          success: false,
          message: 'Phone number and complaint ID are required'
        });
      }

      // Find complaint by ID and verify phone number matches
      const complaint = await Complaint.findById(complaintId);

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: 'Complaint not found'
        });
      }

      // Check if phone number matches (normalize phone numbers)
      const normalizePhone = (phoneNum) => {
        return phoneNum.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');
      };

      const inputPhone = normalizePhone(phone);
      const complaintPhone = normalizePhone(complaint.reporterPhone || '');

      if (inputPhone !== complaintPhone) {
        return res.status(403).json({
          success: false,
          message: 'Phone number does not match our records'
        });
      }

      // Return complaint details (excluding sensitive information)
      const safeComplaintData = {
        _id: complaint._id,
        category: complaint.category,
        description: complaint.description,
        status: complaint.status,
        priority: complaint.priority,
        plantName: complaint.plantName,
        productCode: complaint.productCode,
        batchCode: complaint.batchCode,
        reportedAt: complaint.reportedAt,
        location: complaint.location,
        attachments: complaint.attachments,
        timeline: complaint.timeline,
        isAnonymous: complaint.isAnonymous
      };

      res.json({
        success: true,
        data: safeComplaintData
      });

    } catch (error) {
      logger.error('Track complaint error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to track complaint'
      });
    }
  }
);

// Photo upload endpoint (separate from complaint submission)
complaintsRouter.post(
  '/upload-photos',
  authenticate,
  uploadArray('photos', 5),
  validateFiles({
    required: true,
    minFiles: 1,
    maxFiles: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
  }),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const uploadedFiles = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        url: `/uploads/complaints/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype
      }));

      res.json({
        success: true,
        message: 'Photos uploaded successfully',
        data: { files: uploadedFiles }
      });

    } catch (error) {
      logger.error('Photo upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload photos'
      });
    }
  }
);

// Get all complaints (admin/inspector view)
complaintsRouter.get(
  '/',
  authenticate,
  roleGuard(['admin', 'inspector', 'owner']),
  complaintsController.getComplaints
);

// Get user's own complaints
complaintsRouter.get(
  '/my-complaints',
  authenticate,
  complaintsController.getUserComplaints
);

// Get specific complaint by ID
complaintsRouter.get(
  '/:id',
  authenticate,
  roleGuard(['admin', 'inspector', 'owner']),
  complaintsController.getComplaint
);

// Update complaint status (admin/inspector only)
complaintsRouter.put(
  '/:id/status',
  authenticate,
  roleGuard(['admin', 'inspector']),
  complaintsController.updateComplaintStatus
);

// Assign complaint to inspector
complaintsRouter.post(
  '/:id/assign',
  authenticate,
  roleGuard(['admin']),
  complaintsController.assignComplaint
);

// Escalate complaint to KEBS
complaintsRouter.post(
  '/:id/escalate',
  authenticate,
  roleGuard(['admin', 'inspector']),
  complaintsController.escalateToKEBS
);

module.exports = {
  complaintsRouter
};