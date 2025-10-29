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

Always be helpful, accurate, and reference Kenyan regulations when applicable. If you're unsure about something, recommend consulting with KEBS or relevant authorities.`;

router.post('/query', auth, async (req, res) => {
  try {
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
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

    // TODO: Log query for monitoring and improvement
    console.log('AquaBeacon AI Query:', {
      userId: req.userId,
      question,
      timestamp: new Date().toISOString()
    });

    res.json({
      answer: response.data.choices[0].message.content,
      usage: response.data.usage
    });

  } catch (error) {
    console.error('AI query error:', error);
    
    if (error.response?.status === 401) {
      return res.status(500).json({ message: 'AI service configuration error' });
    }
    
    res.status(500).json({ 
      message: 'Error processing your question. Please try again.' 
    });
  }
});

export default router;
