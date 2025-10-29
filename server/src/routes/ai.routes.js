const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { protect, optionalAuth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiter for AI queries
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 requests per windowMs
  message: 'Too many AI queries, please try again later'
});

// Public routes (with rate limiting)
router.post('/query', optionalAuth, aiLimiter, aiController.queryAI);
router.get('/suggestions', optionalAuth, aiController.getSuggestions);

// Protected routes
router.get('/history/:sessionId', optionalAuth, aiController.getChatHistory);
router.get('/sessions', protect, aiController.getUserSessions);
router.delete('/sessions/:sessionId', protect, aiController.deleteChatSession);

// Admin routes
router.get('/stats', protect, aiController.getAIStats);

module.exports = router;