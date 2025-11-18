const express = require('express');
const router = express.Router();

// Basic monitoring endpoint
router.get('/', async (req, res) => {
  try {
    const monitoring = {
      status: 'active',
      timestamp: new Date().toISOString(),
      metrics: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      }
    };

    res.status(200).json(monitoring);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
