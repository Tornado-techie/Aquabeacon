import React, { useState, useEffect, useRef } from 'react';
import { FiMessageCircle, FiX, FiSend, FiLoader } from 'react-icons/fi';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const AIChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AquaBeacon AI assistant. How can I help you with your water business today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const suggestions = [
    'How do I get KEBS certification?',
    'What are the water quality standards?',
    'How often should I test my water?',
    'Tell me about permit requirements',
    'What equipment do I need?'
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load session ID from localStorage
    const storedSessionId = localStorage.getItem('ai_session_id');
    if (storedSessionId) {
      setSessionId(storedSessionId);
      loadChatHistory(storedSessionId);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async (session) => {
    try {
      const response = await api.get(`/ai/history/${session}`);
      if (response.data.data && response.data.data.messages) {
        setMessages(response.data.data.messages);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to UI
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await api.post('/ai/query', {
        query: userMessage,
        context: {
          userId: user?._id,
          userRole: user?.role,
          sessionId: sessionId
        }
      });

      const { response: aiResponse, sessionId: newSessionId } = response.data.data;

      // Save session ID if new
      if (newSessionId && newSessionId !== sessionId) {
        setSessionId(newSessionId);
        localStorage.setItem('ai_session_id', newSessionId);
      }

      // Add AI response to UI
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: aiResponse }
      ]);
    } catch (error) {
      console.error('AI query error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, but I encountered an error. Please try again or contact support if the issue persists.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I\'m your AquaBeacon AI assistant. How can I help you with your water business today?'
      }
    ]);
    localStorage.removeItem('ai_session_id');
    setSessionId(null);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-all hover:scale-110 z-50 animate-bounce"
        aria-label="Open AI Chat"
      >
        <FiMessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-2xl flex flex-col z-50" style={{ height: '600px' }}>
      {/* Header */}
      <div className="bg-primary-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div>
          <h3 className="font-semibold">AI Assistant</h3>
          <p className="text-xs text-primary-100">Powered by OpenAI</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearChat}
            className="hover:bg-primary-700 p-1 rounded text-xs"
            title="Clear chat"
          >
            Clear
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-primary-700 p-1 rounded"
            aria-label="Close chat"
          >
            <FiX size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 p-3 rounded-lg">
              <FiLoader className="animate-spin text-primary-600" size={20} />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && suggestions.length > 0 && (
        <div className="px-4 pb-2 bg-gray-50">
          <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
          <div className="space-y-2">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left text-xs p-2 bg-white hover:bg-gray-100 rounded border border-gray-200 text-gray-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={loading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <FiSend size={20} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          AI responses may not always be accurate. Verify critical information.
        </p>
      </form>
    </div>
  );
};

export default AIChatWidget;