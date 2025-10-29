const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { ownerOrAdmin } = require('../middleware/roleGuard.middleware');
const Permit = require('../models/Permit');
const { upload } = require('../middleware/rateLimiter.middleware');
const { uploadToS3, generateFileKey } = require('../services/s3.service');

const router = express.Router();

router.post('/', authenticate, ownerOrAdmin, async (req, res) => {
  try {
    const permit = await Permit.create(req.body);
    res.status(201).json({ success: true, data: { permit } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const permits = await Permit.find().populate('plant');
    res.json({ success: true, data: { permits } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:id/document', authenticate, ownerOrAdmin, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const key = generateFileKey('permits/documents', req.file.originalname);
    const url = await uploadToS3(req.file.buffer, key, req.file.mimetype);

    const permit = await Permit.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          documents: {
            name: req.file.originalname,
            url,
            s3Key: key,
            fileType: req.file.mimetype,
            size: req.file.size
          }
        }
      },
      { new: true }
    );

    res.json({ success: true, data: { permit } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;