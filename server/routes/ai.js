import express from 'express';
import { auth } from '../middleware/auth.js';
import axios from 'axios';

const router = express.Router();

// System prompt for water purification context
const SYSTEM_PROMPT = `You are AquaAssistant, an AI expert for water purification and bottling businesses in Kenya, part of the AquaBeacon platform. You provide guidance on:

1. KEBS standards (KS EAS 153, KS EAS 13) and compliance
2. Water quality testing and parameters
3. Permit requirements and application processes
4. Best practices for purification and bottling
5. Complaint resolution and quality control
6. Business operations and regulations in Kenya
7. Water safety education for consumers
8. Understanding water quality issues and their health impacts

Always be helpful, accurate, and reference Kenyan regulations when applicable. If you're unsure about something, recommend consulting with KEBS or relevant authorities. 

For consumer questions, focus on:
- Water safety education
- How to identify quality issues
- Understanding water testing results
- Safe water storage and handling
- When to report water quality concerns
- Basic water treatment at home`;

// Anonymous AI query endpoint (no authentication required)
router.post('/query-anonymous', async (req, res) => {
  try {
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({ 
        success: false,
        message: 'Question is required' 
      });
    }

    // Enhanced system prompt for anonymous users (consumers)
    const consumerPrompt = `${SYSTEM_PROMPT}

You are currently helping an anonymous consumer. Focus on educational content about water safety, quality standards, and general guidance. Do not provide business-specific advice that requires authentication.`;

    const messages = [
      { role: 'system', content: consumerPrompt },
      { role: 'user', content: question }
    ];

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Log anonymous query for monitoring
    console.log('AquaBeacon Anonymous AI Query:', {
      question: question.substring(0, 100), // Log first 100 chars for privacy
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      answer: response.data.choices[0].message.content,
      usage: response.data.usage
    });

  } catch (error) {
    console.error('Anonymous AI query error:', error);
    
    if (error.response?.status === 401) {
      return res.status(500).json({ 
        success: false,
        message: 'AI service configuration error' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error processing your question. Please try again.' 
    });
  }
});

// Authenticated AI query endpoint
router.post('/query', auth, async (req, res) => {
  try {
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({ 
        success: false,
        message: 'Question is required' 
      });
    }

    // TODO: Enhance context with user-specific data (plant info, permits, etc.)
    const enhancedContext = context || {};
    
    if (req.userRole === 'owner') {
      // TODO: Fetch user's plant data and add to context
      enhancedContext.userType = 'business_owner';
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: question }
    ];

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Log query for monitoring and improvement
    console.log('AquaBeacon AI Query:', {
      userId: req.userId,
      question: question.substring(0, 100), // Log first 100 chars
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      answer: response.data.choices[0].message.content,
      usage: response.data.usage
    });

  } catch (error) {
    console.error('AI query error:', error);
    
    if (error.response?.status === 401) {
      return res.status(500).json({ 
        success: false,
        message: 'AI service configuration error' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error processing your question. Please try again.' 
    });
  }
});

export default router;
