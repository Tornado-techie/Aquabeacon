const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { adminOnly, inspectorOrAdmin } = require('../middleware/roleGuard.middleware');
const User = require('../models/User');

const router = express.Router();

router.get('/', authenticate, inspectorOrAdmin, async (req, res) => {
  try {
    let selectFields = '-password';
    
    // If user is inspector, limit the fields they can see
    if (req.user.role === 'inspector') {
      selectFields = 'firstName lastName email role isActive createdAt';
    }
    
    const users = await User.find().select(selectFields);
    res.json({ success: true, data: { users } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', authenticate, inspectorOrAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/role', authenticate, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;