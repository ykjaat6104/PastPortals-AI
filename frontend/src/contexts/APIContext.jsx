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
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Get API key from environment
    const envApiKey = process.env.REACT_APP_GEMINI_API_KEY;
    
    if (envApiKey) {
      setApiKey(envApiKey);
      setIsConfigured(true);
    }

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

    if (!isConfigured || !apiKey) {
      throw new Error('API key not configured');
    }

    setIsLoading(true);
    try {
      console.log('🔍 Asking Gemini:', question);
      console.log('🌍 Language:', getLanguageName(language));
      
      const promptText = language !== 'en' 
        ? `${question}\n\nPlease respond in ${getLanguageName(language)} language.`
        : question;

      const requestBody = {
        contents: [{
          parts: [{ text: promptText }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
        ]
      };

      console.log('📤 Sending request to Gemini API...');
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        }
      );

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Gemini response received');
      
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!result) {
        console.error('⚠️ No text in response:', data);
        throw new Error('No response text received from AI');
      }
      
      console.log('📝 Answer length:', result.length, 'characters');
      return result;
    } catch (error) {
      console.error('❌ Question failed:', error);
      console.error('Full error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    apiKey,
    isConfigured,
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