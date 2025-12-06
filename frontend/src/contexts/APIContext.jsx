import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // API key is now managed by backend - no need to store in frontend
    // This improves security by keeping the key server-side only
    
    // Load saved language
    const savedLanguage = localStorage.getItem('preferred_language') || 'en';
    setLanguage(savedLanguage);
  }, []);

  const changeLanguage = (langCode) => {
    setLanguage(langCode);
    localStorage.setItem('preferred_language', langCode);
    toast.success(`Language changed to ${getLanguageName(langCode)}`);
  };

  const getLanguageName = (code) => {
    const names = {
      en: 'English', hi: 'Hindi', fr: 'French', es: 'Spanish',
      pt: 'Portuguese', ar: 'Arabic', zh: 'Chinese', ja: 'Japanese',
      de: 'German', it: 'Italian', ru: 'Russian', ko: 'Korean'
    };
    return names[code] || 'English';
  };

  const askQuestion = async (question) => {
    if (!question?.trim()) {
      throw new Error('Please enter a question');
    }

    setIsLoading(true);
    try {
      console.log('Asking question via backend:', question);
      console.log('Language:', getLanguageName(language));
      
      // Use backend API instead of calling Gemini directly
      // This keeps the API key secure on the server side
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          language: language !== 'en' ? language : undefined
        })
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Backend response received');
      
      const result = data.answer || data.response;
      
      if (!result) {
        console.error('No text in response:', data);
        throw new Error('No response text received from backend');
      }
      
      console.log('Answer length:', result.length, 'characters');
      return result;
    } catch (error) {
      console.error('Question failed:', error);
      console.error('Full error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isLoading,
    language,
    changeLanguage,
    askQuestion
  };

  return (
    <APIContext.Provider value={value}>
      {children}
    </APIContext.Provider>
  );
};