import React, { useState, useEffect } from 'react';
import { Search, Sparkles, ExternalLink } from 'lucide-react';
import VoiceSearchBar from './VoiceSearchBar';
import { useAPI } from '../contexts/APIContext';
import { useLocation } from 'react-router-dom';
import { getTopicImages } from '../utils/imageSearch';

const SearchPageNew = () => {
  const { askQuestion, language } = useAPI();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [searching, setSearching] = useState(false);
  const [images, setImages] = useState([]);

  useEffect(() => {
    const incomingQuery = location.state?.query || location.state?.searchQuery;
    const shouldAutoSearch = location.state?.autoSearch !== false; // Default to true
    
    if (incomingQuery) {
      setSearchQuery(incomingQuery);
      if (shouldAutoSearch) {
        handleAutoSearch(incomingQuery);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const handleAutoSearch = async (query) => {
    if (query.trim()) {
      setSearching(true);
      setSearchResult('');
      setImages([]);
      
      // Fetch images in parallel with text search
      getTopicImages(query, 4).then(imgs => {
        console.log('📸 Loaded images:', imgs.length);
        setImages(imgs);
      });
      
      try {
        console.log('Starting search for:', query);
        const prompt = `Provide a detailed, comprehensive answer about ${query} in world history (minimum 500 words). Include:
1. Historical background and origins
2. Key events and timeline
3. Cultural and historical significance
4. Impact on civilization
5. Interesting facts and details
6. Legacy and modern relevance
Use Wikipedia and historical sources to provide accurate, well-structured information.`;
        const response = await askQuestion(prompt);
        console.log('Got response, length:', response.length);
        setSearchResult(response);
      } catch (error) {
        console.error('Search error:', error);
        const errorMsg = `Error: ${error.message}

Troubleshooting:
• Check browser console (F12) for details
• Verify internet connection
• API Key: ${error.message.includes('API') ? 'Issue with Gemini API' : 'Connection problem'}`;
        setSearchResult(errorMsg);
      } finally {
        setSearching(false);
      }
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    await handleAutoSearch(searchQuery);
  };

  const suggestions = [
    { icon: '🏛️', text: 'Ancient Rome', gradient: 'from-red-500 to-purple-600' },
    { icon: '🗿', text: 'Egyptian Pyramids', gradient: 'from-yellow-500 to-orange-600' },
    { icon: '🏺', text: 'Greek Mythology', gradient: 'from-blue-500 to-cyan-500' },
    { icon: '🕌', text: 'Mughal Empire', gradient: 'from-orange-500 to-pink-600' },
    { icon: '⚔️', text: 'Medieval Europe', gradient: 'from-gray-600 to-blue-700' },
    { icon: '🎭', text: 'Renaissance Art', gradient: 'from-purple-500 to-pink-500' }
  ];

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    handleAutoSearch(suggestion);
  };

  const getLanguageName = (code) => {
    const names = {
      en: 'English', hi: 'हिन्दी', fr: 'Français', es: 'Español',
      pt: 'Português', ar: 'العربية', zh: '中文', ja: '日本語',
      de: 'Deutsch', it: 'Italiano', ru: 'Русский', ko: '한국어'
    };
    return names[code] || 'English';
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h1 className="page-title">
          <Search size={36} />
          Search History
        </h1>
        <p className="page-subtitle">
          Ask questions about any historical topic, event, or civilization
          <span style={{ marginLeft: '12px', padding: '4px 12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', fontSize: '0.85em', fontWeight: '600', color: '#6366f1' }}>
            {getLanguageName(language)}
          </span>
        </p>
      </div>

      <div className="search-bar-container">
        <VoiceSearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSubmit={handleSearch}
          placeholder="Search for historical topics, events, people..."
          className="main-search-bar"
        />
      </div>

      {!searchResult && (
        <div className="suggestions-section">
          <h2 className="section-title">
            <Sparkles size={20} />
            Popular Topics
          </h2>
          <div className="suggestions-grid">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                className="suggestion-card"
                onClick={() => handleSuggestionClick(suggestion.text)}
              >
                <div className={`suggestion-icon bg-gradient-to-br ${suggestion.gradient}`}>
                  <span>{suggestion.icon}</span>
                </div>
                <span className="suggestion-text">{suggestion.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {searching && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>🔍 Searching through history with AI...</p>
          <small>Powered by Google Gemini</small>
        </div>
      )}

      {searchResult && (
        <div className="search-results">
          <div className="result-header">
            <h2>Search Results</h2>
            <span className="result-badge">AI-Powered</span>
          </div>

          <div className="answer-section-wikipedia">
            <h3 className="section-title">
              <Sparkles size={22} />
              {searchQuery}
            </h3>
            
            <div className="wiki-content">
              {/* Wikipedia-style layout with text wrapping around images */}
              <div className="wiki-article">
                {/* Images float on the right side */}
                {images.length > 0 && images.slice(0, 3).map((img, idx) => (
                  <figure key={idx} className="wiki-infobox">
                    <img 
                      src={img.url} 
                      alt={img.title}
                      loading="lazy"
                    />
                    <figcaption>{img.title}</figcaption>
                  </figure>
                ))}
                
                {/* Text content flows around the images */}
                <div className="wiki-text">
                  {searchResult.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="wiki-paragraph">{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="source-info">
            <ExternalLink size={16} />
            <span>Information sourced from Wikipedia and historical databases | AI-Enhanced</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPageNew;
