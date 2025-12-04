import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    // Handle different error scenarios
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - Please check your internet connection');
    }
    
    if (!error.response) {
      throw new Error('Network error - Unable to connect to server');
    }
    
    const status = error.response.status;
    const message = error.response.data?.error || error.message;
    
    switch (status) {
      case 400:
        throw new Error(message || 'Invalid request');
      case 404:
        throw new Error('Service not found');
      case 500:
        throw new Error('Server error - Please try again later');
      default:
        throw new Error(message || 'An unexpected error occurred');
    }
  }
);

// API methods
export const apiService = {
  // Health check
  checkHealth: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Configure API key
  configureAPI: async (apiKey) => {
    try {
      const response = await api.post('/configure', {
        api_key: apiKey
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Ask question
  askQuestion: async (question) => {
    try {
      const response = await api.post('/ask', {
        question: question
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Translate text
  translateText: async (text, language) => {
    try {
      const response = await api.post('/translate', {
        text: text,
        language: language
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Summarize text
  summarizeText: async (text) => {
    try {
      const response = await api.post('/summarize', {
        text: text
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api;