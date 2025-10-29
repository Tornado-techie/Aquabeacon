const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { ownerOrAdmin } = require('../middleware/roleGuard.middleware');
const LabSample = require('../models/LabSample');

const router = express.Router();

router.post('/', authenticate, ownerOrAdmin, async (req, res) => {
  try {
    const sample = await LabSample.create(req.body);
    res.status(201).json({ success: true, data: { sample } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const { plant, sampleType } = req.query;
    const filter = {};
    if (plant) filter.plant = plant;
    if (sampleType) filter.sampleType = sampleType;

    const samples = await LabSample.find(filter)
      .populate('plant', 'name')
      .sort({ collectionDate: -1 });

    res.json({ success: true, data: { samples } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const sample = await LabSample.findById(req.params.id).populate('plant relatedComplaint');
    if (!sample) {
      return res.status(404).json({ success: false, message: 'Sample not found' });
    }
    res.json({ success: true, data: { sample } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', authenticate, ownerOrAdmin, async (req, res) => {
  try {
    const sample = await LabSample.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: { sample } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;