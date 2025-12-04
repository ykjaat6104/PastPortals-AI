import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../utils/api';
import toast from 'react-hot-toast';

const APIContext = createContext();

export const useAPI = () => {
  const context = useContext(APIContext);
  if (!context) {
    throw new Error('useAPI must be used within an APIProvider');
  }
  return context;
};

export const APIProvider = ({ children }) => {
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState(null);

  useEffect(() => {
    // Load saved API key from localStorage
    const savedApiKey = localStorage.getItem('museum_guide_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      configureAPI(savedApiKey, false);
    }
    
    // Check server health
    checkServerHealth();
  }, []);

  const checkServerHealth = async () => {
    try {
      const health = await apiService.checkHealth();
      setServerStatus(health);
      setIsConfigured(health.ai_configured);
    } catch (error) {
      console.error('Server health check failed:', error);
      setServerStatus({ status: 'offline' });
    }
  };

  const configureAPI = async (key, showToast = true) => {
    if (!key?.trim()) {
      toast.error('Please enter a valid API key');
      return false;
    }

    setIsLoading(true);
    try {
      await apiService.configureAPI(key.trim());
      setApiKey(key.trim());
      setIsConfigured(true);
      
      // Save to localStorage
      localStorage.setItem('museum_guide_api_key', key.trim());
      
      if (showToast) {
        toast.success('API configured successfully!');
      }
      
      // Refresh server status
      await checkServerHealth();
      return true;
    } catch (error) {
      console.error('API configuration failed:', error);
      if (showToast) {
        toast.error(error.message || 'Failed to configure API');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const askQuestion = async (question) => {
    if (!question?.trim()) {
      throw new Error('Please enter a question');
    }

    if (!isConfigured) {
      throw new Error('Please configure your API key first');
    }

    setIsLoading(true);
    try {
      const result = await apiService.askQuestion(question.trim());
      return result;
    } catch (error) {
      console.error('Question failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const translateText = async (text, language) => {
    if (!isConfigured) {
      throw new Error('API key required for translation');
    }

    try {
      const result = await apiService.translateText(text, language);
      return result;
    } catch (error) {
      console.error('Translation failed:', error);
      throw error;
    }
  };

  const summarizeText = async (text) => {
    if (!isConfigured) {
      throw new Error('API key required for summarization');
    }

    try {
      const result = await apiService.summarizeText(text);
      return result;
    } catch (error) {
      console.error('Summarization failed:', error);
      throw error;
    }
  };

  const resetConfiguration = () => {
    setApiKey('');
    setIsConfigured(false);
    localStorage.removeItem('museum_guide_api_key');
    toast.success('Configuration reset');
  };

  const value = {
    apiKey,
    isConfigured,
    isLoading,
    serverStatus,
    configureAPI,
    askQuestion,
    translateText,
    summarizeText,
    resetConfiguration,
    checkServerHealth
  };

  return (
    <APIContext.Provider value={value}>
      {children}
    </APIContext.Provider>
  );
};