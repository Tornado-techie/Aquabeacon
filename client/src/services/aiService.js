class AIService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  }

  async generateResponse(userMessage, chatHistory = []) {
    try {
      const response = await fetch(`${this.baseURL}/ai/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          query: userMessage,
          conversationHistory: chatHistory.slice(-8)
        })
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        const errorMessage =
          data?.message || 'The AI service could not process your request.';
        throw new Error(errorMessage);
      }

      if (typeof data.answer === 'string' && data.answer.trim().length > 0) {
        return data.answer.trim();
      }

      if (data.data?.response && typeof data.data.response === 'string') {
        return data.data.response.trim();
      }

      throw new Error('Received an unexpected response from the AI service.');
    } catch (error) {
      console.error('AI request failed:', error);
      throw error;
    }
  }

  isWaterRelated(message) {
    if (!message || typeof message !== 'string') {
      return false;
    }

    const keywords = [
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

    const lower = message.toLowerCase();
    return keywords.some((keyword) => lower.includes(keyword));
  }
}

export default new AIService();

