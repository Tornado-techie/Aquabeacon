import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAI } from '../context/AIContext';
import aiServiceClient from '../services/aiService';
import { FiInfo, FiAlertTriangle, FiLock, FiRefreshCw, FiHelpCircle } from 'react-icons/fi';

const AIChat = ({ standalone = false, onQuestionClick }) => {
  const componentId = useRef(Math.random().toString(36).substr(2, 9));
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const messagesEndRef = useRef(null);
  
  // AI Context
  const { 
    chatHistory, 
    usageCount, 
    hasExceededLimit, 
    isInitialized,
    FREE_LIMIT,
    addMessage, 
    incrementUsage, 
    clearHistory,
    getRemainingQueries 
  } = useAI();
  
  // Make useAuth optional to avoid errors when used outside AuthProvider
  let user = null;
  let isAuthenticated = false;
  try {
    const auth = useAuth();
    user = auth.user;
    isAuthenticated = auth.isAuthenticated;
  } catch (error) {
    // If not within AuthProvider, user remains null
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Simple function to populate input - expose directly to parent
  const populateInput = useCallback((question) => {
    if (question && typeof question === 'string' && question.trim()) {
      setInput(question.trim());
      // Focus the input field after a short delay to ensure DOM is updated
      setTimeout(() => {
        // Try to find the visible input field
        const inputElements = document.querySelectorAll(`input[placeholder*="Ask about water"]`);
        let targetInput = null;
        
        // Find the visible input field
        for (const input of inputElements) {
          const rect = input.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            targetInput = input;
            break;
          }
        }
        
        if (targetInput) {
          targetInput.focus();
          targetInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, []);

  // Water-related keywords for filtering
  const isWaterRelated = useCallback((text) => {
    return aiServiceClient.isWaterRelated(text);
  }, []);

  // Send message function
  const sendMessage = useCallback(async (messageText = null, isFromButton = false) => {
    const textToSend = messageText || input.trim();
    
    if (!textToSend || isLoading) return;

    if (!isAuthenticated && hasExceededLimit) {
      setShowUpgradePrompt(true);
      return;
    }

    if (standalone && !isWaterRelated(textToSend)) {
      const userMessage = { role: 'user', content: textToSend };
      addMessage(userMessage);
      addMessage({
        role: 'assistant',
        content: `As a free-tier user, your questions are limited to water-related topics. Please ask a question related to water, bottling, or water quality standards.`
      });
      setInput('');
      return;
    }

    const userMessage = { role: 'user', content: textToSend };
    addMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await aiServiceClient.generateResponse(
        textToSend, 
        chatHistory.filter(msg => msg.role === 'user' || msg.role === 'assistant')
      );
      
      addMessage({ role: 'assistant', content: aiResponse });

      if (!isAuthenticated) {
        incrementUsage();
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage({ 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again later.' 
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, hasExceededLimit, isAuthenticated, addMessage, incrementUsage, isWaterRelated, chatHistory, standalone]);

  // Expose function to parent on mount
  useEffect(() => {
    if (onQuestionClick && typeof onQuestionClick === 'function') {
      onQuestionClick(populateInput);
    }
  }, [onQuestionClick, populateInput]);

  // FIX #2: Improved form submission handler
  // FIX #2: Improved form submission handler
  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const trimmedInput = input.trim();
    if (trimmedInput && !isLoading) {
      sendMessage(trimmedInput, true);
    }
  }, [input, isLoading, sendMessage]);

  // FIX #2: Improved key down handler
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      
      const trimmedInput = input.trim();
      if (trimmedInput && !isLoading) {
        sendMessage(trimmedInput, true);
      }
    }
  }, [input, isLoading, sendMessage]);

  // FIX #3: Improved input change handler
  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  // Check if send button should be disabled
  const isSendDisabled = isLoading || !input.trim() || (!isAuthenticated && hasExceededLimit);

  return (
    <div className={`bg-white rounded-lg shadow-lg ${standalone ? 'h-full' : 'h-96'} flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">AquaBeacon AI Assistant</h3>
            <p className="text-sm text-blue-100">Water safety & quality specialist</p>
          </div>
          {!isAuthenticated && (
            <div className="text-right">
              <div className="text-xs text-blue-100">Daily limit</div>
              <div className="text-sm font-semibold">
                {getRemainingQueries()}/{FREE_LIMIT} left
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Usage Warning */}
      {!isAuthenticated && usageCount >= FREE_LIMIT - 2 && (
        <div className="p-3 bg-yellow-50 border-b border-yellow-200">
          <div className="flex items-center text-yellow-800 text-sm">
            <FiAlertTriangle className="mr-2 flex-shrink-0" />
            <span>
              {getRemainingQueries() > 0 
                ? `${getRemainingQueries()} questions remaining today.`
                : 'Daily limit reached.'
              } <Link to="/pricing" className="underline font-medium">Upgrade for unlimited access</Link>
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {chatHistory.length === 0 && !standalone && (
          <div className="text-center text-gray-500 mt-8">
            <FiInfo className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="font-medium">Water Safety AI Assistant</p>
            <p className="text-sm mt-1">Ask me about water quality, safety standards, KEBS regulations, and more!</p>
          </div>
        )}
        
        {chatHistory.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg shadow-sm ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              <div className="whitespace-pre-line text-sm leading-relaxed">{message.content}</div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 rounded-lg z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <div className="text-center">
              <FiLock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Daily Limit Reached
              </h3>
              <p className="text-gray-600 mb-4">
                You've used all {FREE_LIMIT} free questions today. Upgrade for unlimited AI assistance!
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowUpgradePrompt(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Maybe Later
                </button>
                <Link
                  to="/pricing"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
                  onClick={() => setShowUpgradePrompt(false)}
                >
                  Upgrade Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleFormSubmit} className="flex space-x-3" autoComplete="off">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              hasExceededLimit && !isAuthenticated
                ? "Upgrade to continue asking questions..."
                : "Ask about water quality, safety standards, KEBS regulations..."
            }
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            disabled={isLoading || (!isAuthenticated && hasExceededLimit)}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          <button
            type="submit"
            disabled={isSendDisabled}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium transition-colors"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Send'
            )}
          </button>
        </form>
        
        {/* Clear Chat Button */}
        {chatHistory.length > 1 && (
          <div className="mt-3 flex justify-end items-center text-xs text-gray-500">
            <button
              type="button"
              onClick={() => {
                clearHistory();
                // Reset welcome message flag so it shows again after clearing
                const today = new Date().toDateString();
                localStorage.removeItem('aquabeacon_last_welcome');
              }}
              className="flex items-center text-gray-400 hover:text-gray-600 font-medium"
            >
              <FiRefreshCw className="w-3 h-3 mr-1" />
              Clear chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChat;