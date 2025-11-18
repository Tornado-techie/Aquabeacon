import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiMessageCircle, FiX, FiSend, FiLoader, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const AIChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef(null);

  const WELCOME_MESSAGE = {
    role: 'assistant',
    content: 'Hello! I\'m your AquaBeacon AI assistant. How can I help you with your water business today?',
    timestamp: new Date().toISOString(),
    isWelcome: true
  };

  const suggestions = [
    'How do I get KEBS certification?',
    'What are the water quality standards?',
    'How often should I test my water?',
    'Tell me about permit requirements',
    'What equipment do I need for water testing?',
    'How to start a water bottling business?'
  ];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat when component mounts
  useEffect(() => {
    initializeChat();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = useCallback(async () => {
    try {
      // Load session ID from localStorage
      const storedSessionId = localStorage.getItem('ai_session_id');
      
      if (storedSessionId) {
        setSessionId(storedSessionId);
        await loadChatHistory(storedSessionId);
      } else {
        // No existing session, start fresh with welcome message
        setMessages([WELCOME_MESSAGE]);
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      // Fallback to welcome message only
      setMessages([WELCOME_MESSAGE]);
      setIsInitialized(true);
    }
  }, []);

  const loadChatHistory = async (session) => {
    try {
      setError(null);
      const response = await api.get(`/ai/history/${session}`);
      
      if (response.data.success && response.data.data?.messages) {
        const loadedMessages = response.data.data.messages;
        
        // Ensure we have a welcome message
        const hasWelcome = loadedMessages.some(msg => msg.isWelcome || 
          msg.content.includes('AquaBeacon AI assistant'));
        
        if (!hasWelcome) {
          setMessages([WELCOME_MESSAGE, ...loadedMessages]);
        } else {
          setMessages(loadedMessages);
        }
      } else {
        // Invalid response, start fresh
        setMessages([WELCOME_MESSAGE]);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setError('Failed to load chat history');
      // Fallback to welcome message
      setMessages([WELCOME_MESSAGE]);
    }
  };

  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);
    
    // Add user message to UI immediately
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setLoading(true);

    try {
      // Generate session ID if we don't have one
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        currentSessionId = generateSessionId();
        setSessionId(currentSessionId);
        localStorage.setItem('ai_session_id', currentSessionId);
      }

      const response = await api.post('/ai/query', {
        query: userMessage,
        context: {
          userId: user?._id,
          userRole: user?.role,
          sessionId: currentSessionId
        }
      });

      if (response.data.success) {
        const { response: aiResponse, sessionId: newSessionId } = response.data.data;

        // Update session ID if backend provided a new one
        if (newSessionId && newSessionId !== currentSessionId) {
          setSessionId(newSessionId);
          localStorage.setItem('ai_session_id', newSessionId);
        }

        // Add AI response to UI
        const aiMessage = {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setRetryCount(0); // Reset retry count on success
      } else {
        throw new Error(response.data.message || 'AI query failed');
      }
    } catch (error) {
      console.error('AI query error:', error);
      setError('Failed to get AI response');
      
      // Add error message to chat
      const errorMessage = {
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${error.message || 'Network error'}. Please try again or contact support if the issue persists.`,
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = useCallback((suggestion) => {
    setInput(suggestion);
    // Automatically send the suggestion
    setTimeout(() => {
      const event = new Event('submit', { bubbles: true, cancelable: true });
      document.querySelector('#ai-chat-form')?.dispatchEvent(event);
    }, 100);
  }, []);

  const clearChat = useCallback(async () => {
    try {
      // Clear session from backend if we have one
      if (sessionId) {
        await api.delete(`/ai/history/${sessionId}`).catch(console.error);
      }
      
      // Clear local storage and reset state
      localStorage.removeItem('ai_session_id');
      setSessionId(null);
      setMessages([WELCOME_MESSAGE]);
      setError(null);
      setRetryCount(0);
    } catch (error) {
      console.error('Failed to clear chat:', error);
      // Still clear local state even if backend call fails
      localStorage.removeItem('ai_session_id');
      setSessionId(null);
      setMessages([WELCOME_MESSAGE]);
    }
  }, [sessionId]);

  const retryLastMessage = useCallback(async () => {
    if (retryCount >= 3) {
      setError('Maximum retry attempts reached. Please try a different question.');
      return;
    }

    setRetryCount(prev => prev + 1);
    
    // Find the last user message
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
    if (lastUserMessage) {
      setInput(lastUserMessage.content);
    }
  }, [messages, retryCount]);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
    if (!isOpen && !isInitialized) {
      initializeChat();
    }
  }, [isOpen, isInitialized, initializeChat]);

  // Show only suggestions when we have just the welcome message
  const shouldShowSuggestions = messages.length <= 1 || 
    (messages.length === 2 && messages[0].isWelcome);

  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-all hover:scale-110 z-50 animate-bounce"
        aria-label="Open AI Chat"
      >
        <FiMessageCircle size={24} />
        {/* Notification badge for errors */}
        {error && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white rounded-lg shadow-2xl flex flex-col z-50" style={{ height: '480px' }}>
      {/* Header */}
      <div className="bg-primary-600 text-white p-3 rounded-t-lg flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-sm">AI Assistant</h3>
          <p className="text-xs text-primary-100">
            Powered by OpenAI
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {error && (
            <button
              onClick={retryLastMessage}
              className="hover:bg-primary-700 p-1 rounded text-xs flex items-center space-x-1"
              title="Retry last message"
            >
              <FiRefreshCw size={12} />
              <span>Retry</span>
            </button>
          )}
          <button
            onClick={clearChat}
            className="hover:bg-primary-700 p-1 rounded text-xs"
            title="Clear chat"
          >
            Clear
          </button>
          <button
            onClick={toggleChat}
            className="hover:bg-primary-700 p-1 rounded"
            aria-label="Close chat"
          >
            <FiX size={20} />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3">
          <div className="flex items-center">
            <FiAlertCircle className="text-red-400 mr-2" size={16} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
        {!isInitialized ? (
          <div className="flex justify-center items-center h-full">
            <FiLoader className="animate-spin text-primary-600" size={24} />
            <span className="ml-2 text-gray-500">Loading chat...</span>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={`${message.timestamp || index}-${message.role}`}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : message.isError
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.timestamp && (
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-lg flex items-center space-x-2">
                  <FiLoader className="animate-spin text-primary-600" size={16} />
                  <span className="text-sm text-gray-500">AI is thinking...</span>
                </div>
              </div>
            )}
          </>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {shouldShowSuggestions && isInitialized && (
        <div className="px-3 pb-2 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Try asking:</p>
          <div className="grid grid-cols-1 gap-1">
            {suggestions.slice(0, 2).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left text-xs p-2 bg-white hover:bg-blue-50 rounded border border-gray-200 text-gray-700 transition-colors hover:border-primary-300"
                disabled={loading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form 
        id="ai-chat-form"
        onSubmit={handleSubmit} 
        className="p-3 border-t border-gray-200 bg-white rounded-b-lg"
      >
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={loading || !isInitialized}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm disabled:bg-gray-100"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || !isInitialized}
            className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            {loading ? <FiLoader className="animate-spin" size={18} /> : <FiSend size={18} />}
          </button>
        </div>
        
        {/* Character counter and disclaimer */}
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500 truncate">
            AI responses may not always be accurate.
          </p>
          <span className="text-xs text-gray-400 ml-2">
            {input.length}/500
          </span>
        </div>
      </form>
    </div>
  );
};

export default AIChatWidget;