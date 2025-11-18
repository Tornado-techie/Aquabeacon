import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import Plant from '../models/Plant.js';

const router = express.Router();

// Get all plants for user (or all plants for admin)
router.get('/', auth, async (req, res) => {
  try {
    let plants;
    
    if (req.userRole === 'admin') {
      // Admin sees all plants in the system
      plants = await Plant.find({}).populate('owner', 'name email');
    } else {
      // Regular users see only their plants
      plants = await Plant.find({ owner: req.userId });
    }
    
    res.json({
      success: true,
      data: { plants },
      count: plants.length
    });
  } catch (error) {
    console.error('Get plants error:', error);
    res.status(500).json({ message: 'Error fetching plants' });
  }
});

// Create new plant
router.post('/', auth, requireRole(['owner', 'admin']), async (req, res) => {
  try {
    const plantData = {
      ...req.body,
      owner: req.userId
    };

    const plant = new Plant(plantData);
    await plant.save();

    // TODO: Add plant to user's plants array
    res.status(201).json({
      message: 'Plant created successfully',
      plant
    });
  } catch (error) {
    console.error('Create plant error:', error);
    res.status(500).json({ message: 'Error creating plant' });
  }
});

// Get plant by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id)
      .populate('permits')
      .populate('labSamples');

    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    // Check if user has access to this plant
    if (plant.owner.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(plant);
  } catch (error) {
    console.error('Get plant error:', error);
    res.status(500).json({ message: 'Error fetching plant' });
  }
});

export default router;
