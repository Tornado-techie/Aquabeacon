const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { ownerOrAdmin } = require('../middleware/roleGuard.middleware');
const Plant = require('../models/Plant');

const router = express.Router();

router.post('/', authenticate, ownerOrAdmin, async (req, res) => {
  try {
    const plant = await Plant.create({
      ...req.body,
      owner: req.user._id
    });
    res.status(201).json({ success: true, data: { plant } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    let filter = {};
    
    // If user is owner, only show their plants
    // If user is admin or inspector, show all plants
    if (req.user.role === 'owner') {
      filter = { owner: req.user._id };
    }
    
    const plants = await Plant.find(filter).populate('owner', 'firstName lastName email');
    res.json({ success: true, data: { plants } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id).populate('owner permits');
    if (!plant) {
      return res.status(404).json({ success: false, message: 'Plant not found' });
    }
    res.json({ success: true, data: { plant } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', authenticate, ownerOrAdmin, async (req, res) => {
  try {
    const plant = await Plant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: { plant } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update plant status (for inspectors/admins)
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    // Check if user has permission to update plant status
    if (!['admin', 'inspector'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update plant status' });
    }

    const { status } = req.body;
    const validStatuses = ['pending', 'active', 'suspended', 'closed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const plant = await Plant.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    ).populate('owner', 'firstName lastName email');

    if (!plant) {
      return res.status(404).json({ success: false, message: 'Plant not found' });
    }

    res.json({ 
      success: true, 
      data: { plant },
      message: `Plant status updated to ${status}` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', authenticate, ownerOrAdmin, async (req, res) => {
  try {
    await Plant.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Plant deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;