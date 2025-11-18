import express from 'express';
import { auth } from '../middleware/auth.js';
import Complaint from '../models/Complaint.js';

const router = express.Router();

// Get complaints
router.get('/', auth, async (req, res) => {
  try {
    let complaints;
    
    if (req.userRole === 'admin' || req.userRole === 'inspector') {
      // Admin and inspectors see all complaints
      complaints = await Complaint.find({})
        .populate('submittedBy', 'name email')
        .populate('plant', 'name location')
        .sort({ createdAt: -1 })
        .limit(100);
    } else {
      // Regular users see only their complaints
      complaints = await Complaint.find({ submittedBy: req.userId })
        .populate('plant', 'name location')
        .sort({ createdAt: -1 });
    }
    
    res.json({
      success: true,
      data: { complaints },
      count: complaints.length
    });
  } catch (error) {
        logger.error('Error creating complaint:', error);
    res.status(500).json({ message: 'Error fetching complaints' });
  }
});

// Create complaint
router.post('/', auth, async (req, res) => {
  try {
    // TODO: Implement complaint creation with rate limiting
    res.json({ message: 'Complaint submission - TODO' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting complaint' });
  }
});

export default router;
