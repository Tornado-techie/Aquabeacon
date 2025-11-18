import express from 'express';
import { auth } from '../middleware/auth.js';
import AIService from '../src/services/ai.service.js';

const router = express.Router();

// Anonymous AI query endpoint (no authentication required)
router.post('/query-anonymous', async (req, res) => {
  try {
    const { question, context } = req.body;

    // Validate input using AI service
    const validation = AIService.validateQuery(question);
    if (!validation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: validation.errors[0] || 'Invalid question' 
      });
    }

    // Check if question is water-related
    if (!AIService.isWaterRelated(question)) {
      return res.status(400).json({
        success: false,
        message: 'I can only answer questions related to water, water quality, treatment, and bottling. Please ask a water-related question.'
      });
    }

    // Check if AI service is configured
    if (!AIService.isConfigured()) {
      return res.status(500).json({ 
        success: false,
        message: 'AI service is not configured. Please contact support.' 
      });
    }

    const response = await AIService.generateResponse(question, {
      chatHistory: context?.chatHistory || [],
      userRole: 'anonymous'
    });

    // Log anonymous query for monitoring
    logger.info('AquaBeacon Anonymous AI Query:', {
      question: question.substring(0, 100), // Log first 100 chars for privacy
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent'),
      provider: response.provider
    });

    res.json({
      success: true,
      answer: response.response,
      provider: response.provider,
      tags: response.tags
    });

  } catch (error) {
    logger.error('Anonymous AI query error:', error);
    
    res.status(500).json({ 
      success: false,
      message: 'Error processing your question. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Authenticated AI query endpoint
router.post('/query', auth, async (req, res) => {
  try {
    const { question, context, sessionId } = req.body;

    // Validate input using AI service
    const validation = AIService.validateQuery(question);
    if (!validation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: validation.errors[0] || 'Invalid question' 
      });
    }

    // Check if question is water-related
    if (!AIService.isWaterRelated(question)) {
      return res.status(400).json({
        success: false,
        message: 'I can only answer questions related to water, water quality, treatment, and bottling. Please ask a water-related question.'
      });
    }

    // Check if AI service is configured
    if (!AIService.isConfigured()) {
      return res.status(500).json({ 
        success: false,
        message: 'AI service is not configured. Please contact support.' 
      });
    }

    // Get chat history if sessionId is provided
    let chatHistory = context?.chatHistory || [];
    if (sessionId) {
      const savedHistory = await AIService.getChatHistory(sessionId);
      if (savedHistory && savedHistory.messages) {
        chatHistory = savedHistory.messages.slice(-8); // Keep last 8 messages for context
      }
    }

    // TODO: Enhance context with user-specific data (plant info, permits, etc.)
    const enhancedContext = {
      chatHistory,
      userRole: req.userRole,
      userId: req.userId,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip,
      ...context
    };
    
    if (req.userRole === 'owner') {
      // TODO: Fetch user's plant data and add to context
      enhancedContext.userType = 'business_owner';
    }

    const response = await AIService.generateResponse(question, enhancedContext);

    // Save chat history if sessionId is provided
    if (sessionId) {
      await AIService.saveChatHistory(
        sessionId, 
        question, 
        response.response,
        {
          userId: req.userId,
          userRole: req.userRole,
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip,
          tags: response.tags
        }
      );
    }

    // Log query for monitoring and improvement
    logger.info('AquaBeacon AI Query:', {
      userId: req.userId,
      question: question.substring(0, 100), // Log first 100 chars
      timestamp: new Date().toISOString(),
      provider: response.provider,
      sessionId: sessionId || 'none'
    });

    res.json({
      success: true,
      answer: response.response,
      provider: response.provider,
      tags: response.tags,
      sessionId: sessionId
    });

  } catch (error) {
    logger.error('AI query error:', error);
    
    res.status(500).json({ 
      success: false,
      message: 'Error processing your question. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
