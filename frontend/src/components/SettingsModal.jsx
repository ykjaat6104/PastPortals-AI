import React, { useState, useEffect } from 'react';
import { X, Globe, Check } from 'lucide-react';
import { useAPI } from '../contexts/APIContext';

const SettingsModal = ({ isOpen, onClose }) => {
  const { language, changeLanguage } = useAPI();
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
    { code: 'fr', name: 'Français (French)', flag: '🇫🇷' },
    { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸' },
    { code: 'pt', name: 'Português (Portuguese)', flag: '🇵🇹' },
    { code: 'ar', name: 'العربية (Arabic)', flag: '🇸🇦' },
    { code: 'zh', name: '中文 (Chinese)', flag: '🇨🇳' },
    { code: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵' },
    { code: 'de', name: 'Deutsch (German)', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano (Italian)', flag: '🇮🇹' },
    { code: 'ru', name: 'Русский (Russian)', flag: '🇷🇺' },
    { code: 'ko', name: '한국어 (Korean)', flag: '🇰🇷' }
  ];

  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  const handleLanguageChange = (langCode) => {
    setSelectedLanguage(langCode);
    changeLanguage(langCode);
    
    // Show visual feedback
    const langName = languages.find(l => l.code === langCode)?.name || langCode;
    console.log(`🌐 Language changed to: ${langName}`);
  };

  if (!isOpen) return null;

  const getLanguageFlag = (code) => {
    const flags = {
      en: '🇬🇧', hi: '🇮🇳', fr: '🇫🇷', es: '🇪🇸', pt: '🇵🇹', ar: '🇸🇦',
      zh: '🇨🇳', ja: '🇯🇵', de: '🇩🇪', it: '🇮🇹', ru: '🇷🇺', ko: '🇰🇷'
    };
    return flags[code] || '🇬🇧';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings {getLanguageFlag(selectedLanguage)}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          {/* Language Selection */}
          <section className="settings-section">
            <div className="section-header">
              <Globe size={20} />
              <h3>Language / भाषा / Langue</h3>
            </div>
            <div className="language-grid">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`language-option ${selectedLanguage === lang.code ? 'selected' : ''}`}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  <span className="language-flag">{lang.flag}</span>
                  <span className="language-name">{lang.name}</span>
                  {selectedLanguage === lang.code && (
                    <Check size={16} className="check-icon" />
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* About Section */}
          <section className="settings-section">
            <div className="section-header">
              <h3>About PastPortals</h3>
            </div>
            <div className="about-content">
              <p className="about-text">
                Powered by Google Gemini AI and Wikipedia, this application provides 
                comprehensive historical information with AI-generated images and detailed 
                answers about world history, museums, and civilizations.
              </p>
              <div className="feature-list">
                <div className="feature-item">✨ AI-Powered Responses</div>
                <div className="feature-item">🖼️ Image Generation</div>
                <div className="feature-item">🎤 Voice Commands</div>
                <div className="feature-item">🌍 12 Languages Support</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
