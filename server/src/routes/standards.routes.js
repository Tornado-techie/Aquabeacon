const express = require('express');
const Standard = require('../models/Standard');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const standards = await Standard.find(filter);
    res.json({ success: true, data: { standards } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const standard = await Standard.findById(req.params.id);
    if (!standard) {
      return res.status(404).json({ success: false, message: 'Standard not found' });
    }
    res.json({ success: true, data: { standard } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;