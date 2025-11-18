import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    const users = await User.find({}, '-password -refreshToken')
      .sort({ createdAt: -1 })
      .limit(100); // Limit for performance
    
    const userStats = {
      total: users.length,
      byRole: {
        owners: users.filter(u => u.role === 'owner').length,
        consumers: users.filter(u => u.role === 'consumer').length,
        inspectors: users.filter(u => u.role === 'inspector').length,
        admins: users.filter(u => u.role === 'admin').length
      }
    };
    
    res.json({
      success: true,
      data: { users },
      stats: userStats
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

export default router;
