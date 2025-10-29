const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { authenticate, optionalAuthenticate } = require('../middleware/auth.middleware');
const rateLimit = require('express-rate-limit');

// Rate limiter for AI queries
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 requests per windowMs
  message: 'Too many AI queries, please try again later'
});

// Public routes (with rate limiting)
router.post('/query', optionalAuthenticate, aiLimiter, aiController.queryAI);
router.get('/suggestions', optionalAuthenticate, aiController.getSuggestions);

// Protected routes
router.get('/history/:sessionId', optionalAuthenticate, aiController.getChatHistory);
router.get('/sessions', authenticate, aiController.getUserSessions);
router.delete('/sessions/:sessionId', authenticate, aiController.deleteChatSession);

// Admin routes
router.get('/stats', authenticate, aiController.getAIStats);

module.exports = router;