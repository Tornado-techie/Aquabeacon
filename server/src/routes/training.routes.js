const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const TrainingModule = require('../models/TrainingModule');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { category, level } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (level) filter.level = level;

    const modules = await TrainingModule.find(filter);
    res.json({ success: true, data: { modules } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const module = await TrainingModule.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }
    res.json({ success: true, data: { module } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:id/complete', authenticate, async (req, res) => {
  try {
    const { score } = req.body;
    const module = await TrainingModule.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    const passed = score >= module.assessment.passingScore;

    if (passed) {
      module.completions.push({
        user: req.user._id,
        completedAt: new Date(),
        score
      });
      await module.save();
    }

    res.json({ 
      success: true, 
      data: { 
        passed,
        score,
        passingScore: module.assessment.passingScore 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;