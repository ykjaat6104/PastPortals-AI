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
      const response = await api.get('/api/health');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Configure API key
  configureAPI: async (apiKey) => {
    try {
      const response = await api.post('/api/configure', {
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
      const response = await api.post('/api/ask', {
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
      const response = await api.post('/api/translate', {
        text: text,
        language: language
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Summarize text
  summarizeText: async (text, length = 'medium') => {
    try {
      const response = await api.post('/api/summarize', {
        text: text,
        length: length
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get supported languages
  getLanguages: async () => {
    try {
      const response = await api.get('/api/languages');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search museums
  searchMuseums: async (query, limit = 10) => {
    try {
      const response = await api.post('/api/museum/search', {
        query: query,
        limit: limit
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get museum collections
  getMuseumCollections: async () => {
    try {
      const response = await api.get('/api/museum/collections');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get quick facts
  getQuickFacts: async (topic) => {
    try {
      const response = await api.get(`/api/quick-facts/${encodeURIComponent(topic)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get related topics
  getRelatedTopics: async (topic) => {
    try {
      const response = await api.get(`/api/related/${encodeURIComponent(topic)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get system status
  getStatus: async () => {
    try {
      const response = await api.get('/api/status');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get capabilities
  getCapabilities: async () => {
    try {
      const response = await api.get('/api/capabilities');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api;