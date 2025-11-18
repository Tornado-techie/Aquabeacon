import express from 'express';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get permits for user's plants
router.get('/', auth, async (req, res) => {
  try {
    // TODO: Implement permit fetching
    res.json({ message: 'Permits endpoint - TODO' });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching permits' });
  }
});

export default router;
