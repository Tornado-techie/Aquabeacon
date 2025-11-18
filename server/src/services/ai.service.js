const Groq = require('groq-sdk');
const { HfInference } = require('@huggingface/inference');
const AIChatHistory = require('../models/AIChatHistory');

const WATER_KEYWORDS = [
  'water',
  'aqua',
  'h2o',
  'bottling',
  'bottled',
  'ph',
  'tds',
  'bacteria',
  'kebs',
  'quality',
  'testing',
  'treatment',
  'purification',
  'filtration',
  'contamination',
  'drinking',
  'potable',
  'mineral',
  'spring',
  'borehole',
  'well',
  'tap',
  'distilled',
  'reverse osmosis',
  'ro',
  'uv',
  'ozone',
  'disinfection',
  'packaging',
  'bottles',
  'labels',
  'hygiene',
  'sanitation',
  'plant',
  'facility',
  'shelf life',
  'storage',
  'chlorine',
  'fluoride',
  'hardness',
  'softness',
  'alkaline',
  'acidic',
  'minerals',
  'salts',
  'ppm',
  'mg/l',
  'regulations',
  'compliance',
  'license',
  'permit',
  'safety',
  'health'
];

class AIService {
  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY;
    this.groqModel = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
    this.huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY;
    this.huggingFaceModel =
      process.env.HUGGINGFACE_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2';
    this.systemPrompt =
      process.env.AI_SYSTEM_PROMPT ||
      'You are AquaBeacon, a knowledgeable assistant specializing in water quality, safety, treatment, regulation, and business operations. Respond in natural, conversational language. Decline or gently redirect any topic that is not clearly related to water.';

    this.initializeClients();
  }

  initializeClients() {
    this.groqClient = this.groqApiKey ? new Groq({ apiKey: this.groqApiKey }) : null;
    this.huggingFaceClient = this.huggingFaceApiKey
      ? new HfInference(this.huggingFaceApiKey)
      : null;
  }

  validateQuery(query) {
    const errors = [];

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      errors.push('A question is required.');
    }

    if (query && query.length > 1000) {
      errors.push('Questions must be under 1000 characters.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  isWaterRelated(query) {
    if (!query || typeof query !== 'string') {
      return false;
    }

    const normalized = query.toLowerCase();
    const isRelated = WATER_KEYWORDS.some((keyword) => normalized.includes(keyword));
    
    // If strict filtering is disabled, allow all queries
    if (process.env.AI_STRICT_FILTERING === 'false') {
      console.log('AI strict filtering disabled, allowing query');
      return true;
    }
    
    console.log(`Query "${query.substring(0, 50)}..." is water-related: ${isRelated}`);
    return isRelated;
  }

  isConfigured() {
    return this.getAvailableProviders().length > 0;
  }

  getAvailableProviders() {
    const providers = [];
    if (this.groqClient) {
      providers.push('groq');
    }
    if (this.huggingFaceClient) {
      providers.push('huggingface');
    }
    return providers;
  }

  getProviderOrder() {
    const available = this.getAvailableProviders();
    const preferred =
      process.env.AI_PROVIDER_ORDER?.split(',').map((p) => p.trim().toLowerCase()) || [];

    const ordered = preferred.filter((provider) => available.includes(provider));
    const remaining = available.filter((provider) => !ordered.includes(provider));

    return [...ordered, ...remaining];
  }

  formatConversationHistory(conversationHistory = []) {
    return conversationHistory
      .filter(
        (message) =>
          message &&
          typeof message.content === 'string' &&
          ['user', 'assistant'].includes(message.role)
      )
      .slice(-8)
      .map((message) => ({
        role: message.role,
        content: message.content
      }));
  }

  async generateWithGroq(query, conversationHistory) {
    if (!this.groqClient) {
      throw new Error('Groq provider is not configured.');
    }

    try {
      console.log('Groq API request - Model:', this.groqModel);
      console.log('Groq API request - Query length:', query.length);
      
      const messages = [
        { role: 'system', content: this.systemPrompt },
        ...conversationHistory,
        { role: 'user', content: query }
      ];

      const completion = await this.groqClient.chat.completions.create({
        model: this.groqModel,
        messages,
        max_tokens: 768,
        temperature: 0.7,
        top_p: 0.9
      });

      const content = completion.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Groq returned an empty response.');
      }

      console.log('Groq API response successful, length:', content.length);
      return content.trim();
    } catch (error) {
      console.error('Groq API detailed error:', {
        message: error.message,
        status: error.status,
        code: error.code,
        model: this.groqModel
      });
      throw error;
    }
  }

  async generateWithHuggingFace(query, conversationHistory) {
    if (!this.huggingFaceClient) {
      throw new Error('Hugging Face provider is not configured.');
    }

    try {
      console.log('HuggingFace API request - Model:', this.huggingFaceModel);
      console.log('HuggingFace API request - Query length:', query.length);

      const historyText =
        conversationHistory
          .map((message) => `${message.role === 'assistant' ? 'Assistant' : 'User'}: ${message.content}`)
          .join('\n') || 'Assistant: Hello! How can I help you today?';

      const prompt = `${this.systemPrompt}

Conversation so far:
${historyText}

User: ${query}
Assistant:`;

      const response = await this.huggingFaceClient.textGeneration({
        model: this.huggingFaceModel,
        inputs: prompt,
        parameters: {
          max_new_tokens: 512,
          temperature: 0.7,
          top_p: 0.9,
          repetition_penalty: 1.1,
          return_full_text: false,
          do_sample: true
        }
      });

      const text = Array.isArray(response)
        ? response[0]?.generated_text
        : response?.generated_text;

      if (!text) {
        throw new Error('Hugging Face returned an empty response.');
      }

      console.log('HuggingFace API response successful, length:', text.length);
      return text.trim();
    } catch (error) {
      console.error('HuggingFace API detailed error:', {
        message: error.message,
        status: error.status,
        model: this.huggingFaceModel
      });
      throw error;
    }
  }

  extractTags(text) {
    if (!text) {
      return [];
    }

    const tags = [];
    const normalized = text.toLowerCase();

    if (normalized.includes('kebs')) tags.push('regulation');
    if (normalized.includes('test') || normalized.includes('testing')) tags.push('testing');
    if (
      normalized.includes('treatment') ||
      normalized.includes('purification') ||
      normalized.includes('filtration')
    )
      tags.push('treatment');
    if (normalized.includes('business') || normalized.includes('startup')) tags.push('business');
    if (normalized.includes('safety') || normalized.includes('quality')) tags.push('quality');

    return [...new Set(tags)];
  }

  async generateResponse(query, context = {}) {
    const conversationHistory = this.formatConversationHistory(
      context.chatHistory || context.conversationHistory
    );

    const providers = this.getProviderOrder();
    if (providers.length === 0) {
      throw new Error('No AI providers have been configured.');
    }

    const tags = this.extractTags(`${query} ${conversationHistory.map((m) => m.content).join(' ')}`);

    const errors = [];
    for (const provider of providers) {
      try {
        let responseText;
        if (provider === 'groq') {
          responseText = await this.generateWithGroq(query, conversationHistory);
        } else if (provider === 'huggingface') {
          responseText = await this.generateWithHuggingFace(query, conversationHistory);
        }

        if (responseText) {
          return {
            response: responseText,
            provider,
            tags
          };
        }
      } catch (error) {
        errors.push({ 
          provider, 
          message: error.message, 
          status: error.status || error.response?.status,
          code: error.code 
        });
        console.error(`AI provider "${provider}" failed:`, {
          message: error.message,
          status: error.status || error.response?.status,
          code: error.code,
          response: error.response?.data
        });
      }
    }

    // If all providers fail, return a helpful fallback response
    console.error('All AI providers failed, using fallback response');
    console.error('Detailed AI provider errors:', JSON.stringify(errors, null, 2));
    
    return {
      response: `I apologize, but I'm experiencing technical difficulties right now. However, I can help you with water quality questions! 
      
For water quality testing in Kenya, you should follow KEBS standards (KS EAS 153 for drinking water). Key parameters to test include:
- pH levels (6.5-8.5)
- Total Dissolved Solids (TDS)
- Bacteria count
- Chemical contaminants

Please try your question again in a moment, or contact KEBS directly for urgent regulatory matters.`,
      provider: 'fallback',
      tags: ['technical-issue', 'kebs', 'water-quality']
    };
  }

  async getChatHistory(sessionId) {
    if (!sessionId) {
      return null;
    }

    return AIChatHistory.findOne({ sessionId }).lean();
  }

  async saveChatHistory(sessionId, userMessage, assistantMessage, context = {}) {
    if (!sessionId || !userMessage || !assistantMessage) {
      return null;
    }

    const update = {
      $setOnInsert: {
        sessionId
      },
      $set: {
        userRole: context.userRole || 'guest',
        'metadata.userAgent': context.userAgent,
        'metadata.ipAddress': context.ipAddress
      },
      $push: {
        messages: {
          $each: [
            { role: 'user', content: userMessage, timestamp: new Date() },
            { role: 'assistant', content: assistantMessage, timestamp: new Date() }
          ]
        }
      }
    };

    if (context.userId) {
      update.$set.userId = context.userId;
    }

    if (context.plantId) {
      update.$set['context.plantId'] = context.plantId;
    }

    if (Array.isArray(context.tags) && context.tags.length > 0) {
      update.$set['context.tags'] = context.tags;
    }

    return AIChatHistory.findOneAndUpdate({ sessionId }, update, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }).lean();
  }

  async getUserChatSessions(userId, limit = 10) {
    if (!userId) {
      return [];
    }

    return AIChatHistory.find({ userId })
      .sort({ 'metadata.lastActiveAt': -1 })
      .limit(limit)
      .lean();
  }

  getSuggestedQuestions() {
    return [];
  }
}

module.exports = new AIService();

