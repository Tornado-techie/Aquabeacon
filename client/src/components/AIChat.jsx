import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const AIChat = ({ standalone = false }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Make useAuth optional to avoid errors when used outside AuthProvider
  let user = null;
  try {
    const auth = useAuth();
    user = auth.user;
  } catch (error) {
    // If not within AuthProvider, user remains null
    console.log('AIChat: Not within AuthProvider context, using anonymous mode');
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add initial welcome message for standalone mode
  useEffect(() => {
    if (standalone && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Hi! I'm AquaBeacon AI Assistant. I can help you with:

• Understanding water quality standards
• Learning about water safety
• Explaining water testing procedures
• Answering questions about KEBS regulations
• Providing guidance on water purification
• Helping with general water-related concerns

What would you like to know about water safety?`
      }]);
    }
  }, [standalone, messages.length]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Use anonymous endpoint if not authenticated
      const endpoint = user ? '/ai/query' : '/ai/query-anonymous';
      
      const requestData = { 
        question: input,
        context: { 
          userType: user?.role || 'consumer',
          isAnonymous: !user
        }
      };

      const response = await api.post(endpoint, requestData);
      
      if (response.data.success) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.data.answer 
        }]);
      } else {
        throw new Error(response.data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('AI chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${standalone ? 'h-full' : 'h-96'} flex flex-col`}>
      <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
        <h3 className="text-lg font-semibold">AquaBeacon AI Assistant</h3>
        <p className="text-sm text-blue-100">Ask me about water safety and quality standards</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !standalone && (
          <div className="text-center text-gray-500 mt-8">
            <p>Welcome! I can help you with:</p>
            <ul className="mt-2 text-sm space-y-1">
              <li>• Water quality standards</li>
              <li>• Safety guidelines</li>
              <li>• KEBS regulations</li>
              <li>• Water testing procedures</li>
              <li>• Purification methods</li>
            </ul>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="whitespace-pre-line">{message.content}</div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
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

      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about water safety, quality standards..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIChat;
