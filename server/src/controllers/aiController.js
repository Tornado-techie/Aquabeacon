const aiService = require('../services/ai.service');

class AIController {
  /**
   * Rate limiting check for AI queries
   */
  async checkRateLimit(req, res, next) {
    try {
      // Rate limiting is handled by express-rate-limit middleware
      // This function can be used for additional custom rate limiting logic
      next();
    } catch (error) {
      console.error('Rate limit check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking rate limits'
      });
    }
  }

  /**
   * Process AI query
   */
  async processQuery(req, res) {
    try {
      const { query, conversationHistory = [] } = req.body;

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

      // Generate AI response
      const aiResponse = await aiService.generateResponse(query, conversationHistory);

      res.json({
        success: true,
        response: aiResponse,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('AI processing error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process your query. Please try again later.'
      });
    }
  }

  /**
   * Get chat history for a session
   */
  async getChatHistory(req, res) {
    try {
      const { sessionId } = req.params;

      // For now, we don't store chat history on the server
      // This would be implemented when adding persistent chat storage
      res.json({
        success: true,
        sessionId,
        history: [],
        message: 'Chat history is stored locally in your browser'
      });

    } catch (error) {
      console.error('Get chat history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve chat history'
      });
    }
  }

  /**
   * Clear chat session
   */
  async clearChatSession(req, res) {
    try {
      const { sessionId } = req.params;

      // For now, we don't store chat history on the server
      // This would be implemented when adding persistent chat storage
      res.json({
        success: true,
        sessionId,
        message: 'Chat session cleared (local storage)'
      });

    } catch (error) {
      console.error('Clear chat session error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear chat session'
      });
    }
  }

  /**
   * Get AI chat statistics (admin only)
   */
  async getChatStats(req, res) {
    try {
      // This would be implemented with actual usage tracking
      const stats = {
        totalQueries: 0,
        activeUsers: 0,
        topicBreakdown: {
          waterQuality: 0,
          kebs: 0,
          testing: 0,
          business: 0,
          safety: 0,
          other: 0
        },
        averageResponseTime: 0,
        userSatisfaction: 0
      };

      res.json({
        success: true,
        stats,
        message: 'AI statistics (placeholder data)'
      });

    } catch (error) {
      console.error('Get chat stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve chat statistics'
      });
    }
  }

  /**
   * Get suggested questions
   */
  async getSuggestedQuestions(req, res) {
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
  }
}

module.exports = new AIController();