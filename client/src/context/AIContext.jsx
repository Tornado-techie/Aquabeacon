import React, { createContext, useContext, useState, useEffect } from 'react';

const AIContext = createContext();

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export const AIProvider = ({ children }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [usageCount, setUsageCount] = useState(0);
  const [hasExceededLimit, setHasExceededLimit] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const FREE_LIMIT = 6;
  
  // Load from localStorage on initialization
  useEffect(() => {
    const savedHistory = localStorage.getItem('aquabeacon_chat_history');
    const savedUsage = localStorage.getItem('aquabeacon_ai_usage');
    const lastResetDate = localStorage.getItem('aquabeacon_last_reset');
    
    // Reset usage daily
    const today = new Date().toDateString();
    if (lastResetDate !== today) {
      setUsageCount(0);
      setHasExceededLimit(false);
      localStorage.setItem('aquabeacon_ai_usage', '0');
      localStorage.setItem('aquabeacon_last_reset', today);
    } else {
      if (savedUsage) {
        const usage = parseInt(savedUsage);
        setUsageCount(usage);
        setHasExceededLimit(usage >= FREE_LIMIT);
      }
    }
    
    if (savedHistory) {
      try {
        setChatHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error parsing chat history:', error);
      }
    }
    
    setIsInitialized(true);
  }, []);
  
  // Save to localStorage whenever history changes
  useEffect(() => {
    localStorage.setItem('aquabeacon_chat_history', JSON.stringify(chatHistory));
  }, [chatHistory]);
  
  // Save usage count changes
  useEffect(() => {
    localStorage.setItem('aquabeacon_ai_usage', usageCount.toString());
    setHasExceededLimit(usageCount >= FREE_LIMIT);
  }, [usageCount]);
  
  const addMessage = (message) => {
    setChatHistory(prev => [...prev, { ...message, timestamp: Date.now() }]);
  };
  
  const incrementUsage = () => {
    setUsageCount(prev => prev + 1);
  };
  
  const clearHistory = () => {
    setChatHistory([]);
  };
  
  const resetDailyUsage = () => {
    setUsageCount(0);
    setHasExceededLimit(false);
    localStorage.setItem('aquabeacon_ai_usage', '0');
    localStorage.setItem('aquabeacon_last_reset', new Date().toDateString());
  };
  
  const getRemainingQueries = () => {
    return Math.max(0, FREE_LIMIT - usageCount);
  };
  
  const value = {
    chatHistory,
    usageCount,
    hasExceededLimit,
    isInitialized,
    FREE_LIMIT,
    addMessage,
    incrementUsage,
    clearHistory,
    resetDailyUsage,
    getRemainingQueries
  };
  
  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};