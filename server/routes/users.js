import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    // TODO: Implement user listing with pagination
    res.json({ message: 'Users endpoint - TODO' });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

export default router;
