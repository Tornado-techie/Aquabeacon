const aiService = require('../services/ai.service');
const { v4: uuidv4 } = require('uuid');
const AIChatHistory = require('../models/AIChatHistory');

// Query AI Assistant
exports.queryAI = async (req, res) => {
  try {
    const { query, context = {} } = req.body;

    // Validation
    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Query is required'
      });
    }

    if (query.length > 1000) {
      return res.status(400).json({
        status: 'error',
        message: 'Query is too long (max 1000 characters)'
      });
    }

    // Get or create session ID
    let sessionId = context.sessionId;
    if (!sessionId) {
      sessionId = uuidv4();
    }

    // Build context
    const enrichedContext = {
      userId: req.user?._id,
      userRole: req.user?.role || context.userRole || 'guest',
      sessionId,
      plantId: context.plantId,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress
    };

    // Get chat history for context
    const chatHistory = await aiService.getChatHistory(sessionId);
    if (chatHistory) {
      enrichedContext.chatHistory = chatHistory.messages;
    }

    // Generate AI response
    const result = await aiService.generateResponse(query, enrichedContext);

    enrichedContext.tags = result.tags;

    // Save to database
    await aiService.saveChatHistory(
      sessionId,
      query,
      result.response,
      enrichedContext
    );

    res.status(200).json({
      status: 'success',
      data: {
        response: result.response,
        sessionId,
        tags: result.tags,
        provider: result.provider,
        suggestions: aiService.getSuggestedQuestions(enrichedContext.userRole)
      }
    });
  } catch (error) {
    console.error('AI Query Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process AI query',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get chat history
exports.getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        status: 'error',
        message: 'Session ID is required'
      });
    }

    const chatHistory = await aiService.getChatHistory(sessionId);

    if (!chatHistory) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat history not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: chatHistory
    });
  } catch (error) {
    console.error('Get Chat History Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve chat history'
    });
  }
};

// Get user's chat sessions
exports.getUserSessions = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const limit = parseInt(req.query.limit) || 10;
    const sessions = await aiService.getUserChatSessions(req.user._id, limit);

    res.status(200).json({
      status: 'success',
      data: sessions
    });
  } catch (error) {
    console.error('Get User Sessions Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve chat sessions'
    });
  }
};

// Get suggested questions
exports.getSuggestions = async (req, res) => {
  try {
    const userRole = req.user?.role || req.query.role || 'guest';
    const suggestions = aiService.getSuggestedQuestions(userRole);

    res.status(200).json({
      status: 'success',
      data: {
        suggestions,
        role: userRole
      }
    });
  } catch (error) {
    console.error('Get Suggestions Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get suggestions'
    });
  }
};

// Delete chat session
exports.deleteChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        status: 'error',
        message: 'Session ID is required'
      });
    }

    const chatHistory = await aiService.getChatHistory(sessionId);

    if (!chatHistory) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat session not found'
      });
    }

    // Check if user owns this session
    if (req.user && chatHistory.userId && chatHistory.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to delete this session'
      });
    }

    await AIChatHistory.deleteOne({ sessionId });

    res.status(200).json({
      status: 'success',
      message: 'Chat session deleted successfully'
    });
  } catch (error) {
    console.error('Delete Chat Session Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete chat session'
    });
  }
};

// Get AI statistics (for admin)
exports.getAIStats = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const stats = await AIChatHistory.aggregate([
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalMessages: { $sum: '$metadata.totalMessages' },
          averageMessagesPerSession: { $avg: '$metadata.totalMessages' }
        }
      }
    ]);

    const topTags = await AIChatHistory.aggregate([
      { $unwind: '$context.tags' },
      { $group: { _id: '$context.tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        ...stats[0],
        topTags
      }
    });
  } catch (error) {
    console.error('Get AI Stats Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve AI statistics'
    });
  }
};