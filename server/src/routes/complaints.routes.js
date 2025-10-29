const express = require('express');
const { body } = require('express-validator');
const { authenticate, optionalAuthenticate } = require('../middleware/auth.middleware');
const { roleGuard } = require('../middleware/roleGuard.middleware');
const { complaintLimiter, upload, virusScan } = require('../middleware/rateLimiter.middleware');
const { validate } = require('../middleware/validator.middleware');
const complaintsController = require('../controllers/complaints.controller');
const aiController = require('../controllers/ai.controller');
const { uploadToS3, generateFileKey } = require('../services/s3.service');
const { aiLimiter } = require('../middleware/rateLimiter.middleware');
const logger = require('../utils/logger');

const complaintsRouter = express.Router();
const aiRouter = express.Router();

// Complaint validation
const complaintValidation = [
  body('isAnonymous').optional().custom((value) => {
    // Convert string 'true'/'false' to boolean
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return true;
    if (value === undefined || value === null) return true;
    throw new Error('isAnonymous must be a boolean');
  }),
  body('consumerName').custom((value, { req }) => {
    const isAnonymous = req.body.isAnonymous === 'true' || req.body.isAnonymous === true;
    if (!isAnonymous && (!value || value.trim() === '')) {
      throw new Error('Your name is required when not reporting anonymously');
    }
    return true;
  }).trim(),
  body('consumerEmail').optional().isEmail().withMessage('Valid email required'),
  body('consumerPhone').custom((value, { req }) => {
    const isAnonymous = req.body.isAnonymous === 'true' || req.body.isAnonymous === true;
    if (!isAnonymous && (!value || value.trim() === '')) {
      throw new Error('Phone number is required when not reporting anonymously');
    }
    if (value && value.trim() !== '' && !/^\+?[\d\s-()]+$/.test(value)) {
      throw new Error('Valid phone number required');
    }
    return true;
  }),
  body('reportedBusinessName').trim().notEmpty().withMessage('Water business name or brand is required'),
  body('complaintType').notEmpty().withMessage('Complaint type is required')
    .isIn([
      'quality', 'packaging', 'contamination', 'other'
    ]).withMessage('Invalid complaint type'),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('productCode').optional(),
  body('batchCode').optional(),
  // Custom validator for photos
  body('photos').custom((value, { req }) => {
    if (!req.files || req.files.length === 0) {
      throw new Error('At least one photo is required');
    }
    return true;
  }),
];

// Complaint routes
complaintsRouter.post(
  '/',
  complaintLimiter,
  upload.multiple('photos', 5),
  complaintValidation,
  validate,
  complaintsController.submitComplaint
);

complaintsRouter.post(
  '/upload-photos',
  complaintLimiter,
  upload.multiple('photos', 5),
  virusScan,
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const uploadPromises = req.files.map(async (file) => {
        const key = generateFileKey('complaints/photos', file.originalname);
        const url = await uploadToS3(file.buffer, key, file.mimetype);
        return {
          url,
          s3Key: key,
          originalName: file.originalname,
          size: file.size
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      res.json({
        success: true,
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

complaintsRouter.get(
  '/',
  authenticate,
  roleGuard(['admin', 'inspector', 'owner']),
  complaintsController.getComplaints
);

complaintsRouter.get(
  '/:id',
  authenticate,
  roleGuard(['admin', 'inspector', 'owner']),
  complaintsController.getComplaint
);

complaintsRouter.put(
  '/:id',
  authenticate,
  roleGuard(['admin', 'inspector']),
  complaintsController.updateComplaint
);

complaintsRouter.post(
  '/:id/assign',
  authenticate,
  roleGuard(['admin']),
  complaintsController.assignComplaint
);

complaintsRouter.post(
  '/:id/escalate',
  authenticate,
  roleGuard(['admin', 'inspector']),
  complaintsController.escalateToKEBS
);

// AI routes
aiRouter.post(
  '/query',
  authenticate,
  aiLimiter,
  [
    body('question')
      .trim()
      .notEmpty()
      .withMessage('Question is required')
      .isLength({ min: 5, max: 2000 })
      .withMessage('Question must be between 5 and 2000 characters')
  ],
  validate,
  aiController.queryAI
);

aiRouter.get(
  '/suggestions',
  authenticate,
  aiController.getSuggestions
);

module.exports = {
  complaintsRouter,
  aiRouter
};