// routes/dashboard.routes.js

const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const dashboardController = require('../controllers/dashboard.controller');

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticate);

// Get dashboard statistics
router.get('/stats', dashboardController.getDashboardStats);

// Get recent activities
router.get('/activities', dashboardController.getRecentActivities);

module.exports = router;