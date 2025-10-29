const OpenAI = require('openai');
const AIChatHistory = require('../models/AIChatHistory');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// System prompt for water business context
const SYSTEM_PROMPT = `You are an expert AI assistant for AquaBeacon, a water business management platform in Kenya. Your role is to help entrepreneurs, inspectors, and consumers with water purification and bottling businesses.

**Your expertise includes:**
1. KEBS Standards (KS EAS 153:2000 for bottled water, KS EAS 13:2019 for water vending)
2. Water quality parameters (pH, turbidity, TDS, bacteria counts, etc.)
3. Business setup and registration in Kenya
4. Permit applications and compliance
5. Equipment requirements and costs
6. Water treatment methods (filtration, RO, UV, chlorination, ozonation)
7. Lab testing procedures and schedules
8. KEBS certification process
9. Safety and hygiene practices
10. Business scaling and growth strategies

**KEBS Water Quality Standards Reference:**
- pH: 6.5 - 8.5
- Turbidity: < 5 NTU
- Total Dissolved Solids (TDS): 50 - 500 mg/L
  - If asked about pricing, mention: Free tier available, Pro at KES 5/month
- Chlorine residual (if chlorinated): 0.2 - 0.5 mg/L

**Guidelines:**
- Provide accurate, helpful, and concise answers
- Reference KEBS standards when relevant
- Suggest AquaBeacon features that can help (dashboard, lab booking, compliance tracking)
  - If asked about pricing, mention: Free tier available, Pro at KES 5/month
- For complex compliance issues, suggest contacting KEBS directly
- Be encouraging and supportive of entrepreneurs
- Prioritize safety and compliance in all recommendations
- If you don't know something, admit it and suggest reliable resources

**Response Style:**
- Professional but friendly and approachable
- Use bullet points for clarity when listing steps or requirements
- Include relevant costs when discussing equipment or services
- Mention typical timelines for processes (e.g., KEBS certification takes 2-4 months)

Remember: You're helping build compliant, safe water businesses that serve Kenyan communities!`;

class AIService {
  // Generate AI response
  async generateResponse(userMessage, context = {}) {
    try {
      const { userId, userRole, sessionId, chatHistory = [] } = context;

      // Build conversation history
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT }
      ];

      // Add context about user if available
      if (userRole && userRole !== 'guest') {
        messages.push({
          role: 'system',
          content: `User context: This is a ${userRole} using AquaBeacon. Tailor your response accordingly.`
        });
      }

      // Add recent chat history (last 10 messages for context)
      const recentHistory = chatHistory.slice(-10);
      recentHistory.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });

      // Add current user message
      messages.push({
        role: 'user',
        content: userMessage
      });

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: process.env.AI_MODEL || 'gpt-4',
        messages: messages,
        max_tokens: parseInt(process.env.AI_MAX_TOKENS) || 500,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0.3
      });

      const aiResponse = completion.choices[0].message.content;

      // Extract topics/tags for categorization
      const tags = this.extractTags(userMessage);

      return {
        response: aiResponse,
        usage: completion.usage,
        tags
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  // Save chat to database
  async saveChatHistory(sessionId, userMessage, aiResponse, context = {}) {
    try {
      const { userId, userRole, plantId } = context;

      let chatHistory = await AIChatHistory.findOne({ sessionId });

      if (!chatHistory) {
        // Create new chat session
        chatHistory = new AIChatHistory({
          userId: userId || null,
          sessionId,
          userRole: userRole || 'guest',
          messages: [],
          context: {
            plantId: plantId || null,
            tags: []
          },
          metadata: {
            userAgent: context.userAgent,
            ipAddress: context.ipAddress
          }
        });
      }

      // Add user message
      chatHistory.messages.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      });

      // Add AI response
      chatHistory.messages.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      });

      // Update tags
      const newTags = this.extractTags(userMessage);
      chatHistory.context.tags = [...new Set([...chatHistory.context.tags, ...newTags])];

      await chatHistory.save();

      return chatHistory;
    } catch (error) {
      console.error('Save Chat History Error:', error);
      throw error;
    }
  }

  // Get chat history by session
  async getChatHistory(sessionId) {
    try {
      const chatHistory = await AIChatHistory.findOne({ sessionId })
        .select('messages userRole context')
        .lean();

      return chatHistory;
    } catch (error) {
      console.error('Get Chat History Error:', error);
      throw error;
    }
  }

  // Get user's chat sessions
  async getUserChatSessions(userId, limit = 10) {
    try {
      const sessions = await AIChatHistory.find({ userId })
        .sort({ 'metadata.lastActiveAt': -1 })
        .limit(limit)
        .select('sessionId messages context metadata createdAt')
        .lean();

      return sessions;
    } catch (error) {
      console.error('Get User Chat Sessions Error:', error);
      throw error;
    }
  }

  // Extract relevant tags from message
  extractTags(message) {
    const lowerMessage = message.toLowerCase();
    const tags = [];

    // Topic keywords
    const topicMap = {
      'kebs': ['kebs', 'standard', 'certification', 'permit', 'compliance'],
      'water_quality': ['ph', 'tds', 'turbidity', 'bacteria', 'quality', 'test', 'lab'],
      'equipment': ['equipment', 'machine', 'filter', 'ro', 'uv', 'treatment'],
      'business': ['business', 'startup', 'cost', 'price', 'profit', 'revenue'],
      'registration': ['register', 'license', 'permit', 'application'],
      'bottling': ['bottle', 'packaging', 'label', 'cap'],
      'purification': ['purify', 'treatment', 'filter', 'clean']
    };

    for (const [tag, keywords] of Object.entries(topicMap)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        tags.push(tag);
      }
    }

    return tags;
  }

  // Get suggested questions based on user role
  getSuggestedQuestions(userRole = 'guest') {
    const suggestions = {
      guest: [
        'What are the KEBS requirements for bottled water in Kenya?',
        'How much does it cost to start a water bottling business?',
        'What equipment do I need for water purification?',
        'How do I check if bottled water is KEBS certified?'
      ],
      owner: [
        'How do I renew my KEBS permit?',
        'What are the water quality testing schedules required?',
        'How can I scale my water business?',
        'What are common compliance issues to avoid?'
      ],
      inspector: [
        'What should I check during a plant inspection?',
        'How do I report non-compliant facilities?',
        'What are the hygiene standards for water plants?',
        'How do I verify lab test results?'
      ],
      consumer: [
        'How do I know if my water is safe?',
        'What should I do if I find contaminated water?',
        'How can I track my complaint status?',
        'What are signs of water quality issues?'
      ]
    };

    return suggestions[userRole] || suggestions.guest;
  }
}

module.exports = new AIService();