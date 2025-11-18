// routes/ai.routes.js - AI chat routes

const express = require('express');
const router = express.Router();
const aiService = require('../services/ai.service');

// Rate limiting middleware
const rateLimit = require('express-rate-limit');

// Rate limiter for AI queries
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    // Authenticated users get higher limits
    return req.user ? 50 : 10;
  },
  message: {
    success: false,
    message: 'Too many AI requests, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Public route for AI queries
router.post('/query', aiRateLimit, async (req, res) => {
  try {
    const { query, conversationHistory = [], context = {} } = req.body;

    // Validate query
    const validation = aiService.validateQuery(query);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors.join(', ')
      });
    }

    // Check if query is water-related
    if (!aiService.isWaterRelated(query)) {
      return res.status(400).json({
        success: false,
        message: 'Please ask questions related to water quality, safety, or water business topics.'
      });
    }

    // Check if AI service is configured
    if (!aiService.isConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'AI service is currently unavailable. Please try again later or contact support.'
      });
    }

    // Generate AI response with provider failover
    const result = await aiService.generateResponse(query, {
      conversationHistory,
      sessionId: context.sessionId,
      userRole: req.user?.role || context.userRole,
      userId: req.user?._id
    });

    // Log successful query for monitoring
    console.log('AI Query processed:', {
      sessionId: context.sessionId || 'no-session',
      queryLength: query.length,
      responseLength: result.response.length,
      timestamp: new Date().toISOString(),
      availableProviders: aiService.getAvailableProviders()
    });

    res.json({
      success: true,
      data: {
        response: result.response,
        sessionId: context.sessionId || `session_${Date.now()}`,
        timestamp: new Date().toISOString(),
        provider: result.provider || 'unknown',
        tags: result.tags || []
      }
    });

  } catch (error) {
    console.error('AI processing error:', {
      message: error.message,
      stack: error.stack,
      details: error.details
    });
    
    res.status(500).json({
      success: false,
      message: 'Unable to generate a response at this time. Please try again shortly.',
      debug: {
        error: error.message,
        details: error.details,
        configured: aiService.isConfigured(),
        providers: aiService.getAvailableProviders()
      }
    });
  }
});

// Get suggested questions
router.get('/suggestions', (req, res) => {
  try {
    const suggestions = aiService.getSuggestedQuestions();
    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Get suggested questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve suggested questions'
    });
  }
});

// Get chat history for a session
router.get('/history/:sessionId', (req, res) => {
  try {
    // For now, return empty history since we don't have history storage implemented
    // TODO: Implement actual history storage and retrieval
    res.json({
      success: true,
      data: {
        messages: [],
        sessionId: req.params.sessionId
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat history'
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  const availableProviders = aiService.getAvailableProviders();
  
  res.json({
    success: true,
    message: 'AI service is running',
    timestamp: new Date().toISOString(),
    configured: aiService.isConfigured(),
    availableProviders: availableProviders,
    providerCount: availableProviders.length,
    status: availableProviders.length > 0 ? 'healthy' : 'no-providers-configured'
  });
});

// Debug endpoint to test AI service step by step
router.post('/debug', async (req, res) => {
  try {
    const testQuery = 'What is water?';
    
    // Step 1: Check configuration
    console.log('=== AI Debug Test ===');
    console.log('Environment check:');
    console.log('- GROQ_API_KEY exists:', !!process.env.GROQ_API_KEY);
    console.log('- GROQ_API_KEY length:', process.env.GROQ_API_KEY?.length || 0);
    console.log('- HUGGINGFACE_API_KEY exists:', !!process.env.HUGGINGFACE_API_KEY);
    console.log('- HUGGINGFACE_API_KEY length:', process.env.HUGGINGFACE_API_KEY?.length || 0);
    
    console.log('Available providers:', aiService.getAvailableProviders());
    console.log('Is configured:', aiService.isConfigured());
    
    // Step 2: Validate query
    const validation = aiService.validateQuery(testQuery);
    console.log('Query validation:', validation);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Query validation failed',
        errors: validation.errors
      });
    }
    
    // Step 3: Check if water-related
    const isWaterRelated = aiService.isWaterRelated(testQuery);
    console.log('Is water related:', isWaterRelated);
    
    if (!isWaterRelated) {
      return res.status(400).json({
        success: false,
        message: 'Not water-related'
      });
    }
    
    // Step 4: Try to generate response
    console.log('Attempting to generate response...');
    const result = await aiService.generateResponse(testQuery, {});
    console.log('Response generated successfully:', result.provider);
    
    res.json({
      success: true,
      message: 'AI debug test passed',
      result: {
        provider: result.provider,
        responseLength: result.response.length,
        tags: result.tags
      }
    });
    
  } catch (error) {
    console.error('AI Debug Error:', {
      message: error.message,
      stack: error.stack,
      details: error.details
    });
    
    res.status(500).json({
      success: false,
      message: 'AI debug test failed',
      error: error.message,
      details: error.details
    });
  }
});

// AI Analytics endpoint for admin dashboard
router.get('/analytics', async (req, res) => {
  try {
    // Check if user is authenticated and is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const analyticsController = require('../controllers/analytics.controller');
    return analyticsController.getAIAnalytics(req, res);
    
  } catch (error) {
    console.error('AI Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI analytics'
    });
  }
});

module.exports = router;