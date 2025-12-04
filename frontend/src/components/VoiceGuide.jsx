import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  Download,
  Languages,
  Headphones,
  History
} from 'lucide-react';
import { apiService } from '../utils/api';
import { useLocalStorage } from '../hooks/useCustomHooks';
import toast from 'react-hot-toast';

const VoiceGuide = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useLocalStorage('voiceGuideLanguage', 'en');
  const [history, setHistory] = useLocalStorage('voiceGuideHistory', []);
  const [showHistory, setShowHistory] = useState(false);
  
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = getLanguageCode(language);

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setTranscript(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcript) {
          handleQuery(transcript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Speech recognition error. Please try again.');
      };
    } else {
      toast.error('Speech recognition not supported in your browser');
    }

    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [language]);

  const getLanguageCode = (lang) => {
    const langCodes = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-PT',
      'zh': 'zh-CN',
      'ja': 'ja-JP',
      'ar': 'ar-SA',
      'hi': 'hi-IN'
    };
    return langCodes[lang] || 'en-US';
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not available');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setResponse('');
      recognitionRef.current.lang = getLanguageCode(language);
      recognitionRef.current.start();
      setIsListening(true);
      toast.success('Listening... Speak now!');
    }
  };

  const handleQuery = async (question) => {
    if (!question.trim()) return;

    setLoading(true);
    
    try {
      // Get answer from API
      const result = await apiService.askQuestion(question);
      let answer = result.answer || 'No response received';

      // Translate if needed
      if (language !== 'en') {
        const translationResult = await apiService.translateText(answer, language);
        answer = translationResult.translated_text || answer;
      }

      setResponse(answer);

      // Add to history
      const historyItem = {
        id: Date.now(),
        question,
        answer,
        timestamp: new Date().toISOString(),
        language
      };
      setHistory(prev => [historyItem, ...prev].slice(0, 20)); // Keep last 20

      // Speak the response
      speakText(answer);

    } catch (error) {
      console.error('Error processing query:', error);
      toast.error('Failed to process your question');
      setResponse('Sorry, I encountered an error processing your question.');
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    if (!synthRef.current) {
      toast.error('Text-to-speech not available');
      return;
    }

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLanguageCode(language);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
      toast.error('Error playing audio');
    };

    // Get available voices and select appropriate one
    const voices = synthRef.current.getVoices();
    const langVoice = voices.find(voice => voice.lang.startsWith(language));
    if (langVoice) {
      utterance.voice = langVoice;
    }

    synthRef.current.speak(utterance);
  };

  const togglePlayPause = () => {
    if (!synthRef.current || !response) return;

    if (isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
    } else if (synthRef.current.paused) {
      synthRef.current.resume();
      setIsPlaying(true);
    } else {
      speakText(response);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
    }
  };

  const handleHistoryItemClick = (item) => {
    setTranscript(item.question);
    setResponse(item.answer);
    setShowHistory(false);
    speakText(item.answer);
  };

  const clearHistory = () => {
    setHistory([]);
    toast.success('History cleared');
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' }
  ];

  return (
    <div className="voice-guide-page">
      <div className="voice-guide-container">
        {/* Header */}
        <motion.div 
          className="voice-guide-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Headphones size={48} color="#10B981" />
          <h1>AI Voice Museum Guide</h1>
          <p>Ask questions and listen to historical insights in your language</p>
        </motion.div>

        {/* Language Selector */}
        <div className="language-selector">
          <Languages size={20} />
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="language-dropdown"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Main Voice Interface */}
        <motion.div 
          className="voice-interface"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {/* Microphone Button */}
          <div className="mic-container">
            <motion.button
              className={`mic-button ${isListening ? 'listening' : ''}`}
              onClick={toggleListening}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={isListening ? {
                boxShadow: [
                  '0 0 0 0 rgba(16, 185, 129, 0.7)',
                  '0 0 0 20px rgba(16, 185, 129, 0)',
                ],
              } : {}}
              transition={isListening ? {
                repeat: Infinity,
                duration: 1.5
              } : {}}
            >
              <Mic size={32} />
            </motion.button>
            <p className="mic-label">
              {isListening ? 'Listening...' : 'Click to speak'}
            </p>
          </div>

          {/* Transcript Display */}
          <AnimatePresence>
            {transcript && (
              <motion.div 
                className="transcript-box"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h3>Your Question:</h3>
                <p>{transcript}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          {loading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Processing your question...</p>
            </div>
          )}

          {/* Response Display */}
          <AnimatePresence>
            {response && !loading && (
              <motion.div 
                className="response-box"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h3>Guide's Response:</h3>
                <div className="response-content">
                  <Volume2 className="speaker-icon" />
                  <p>{response}</p>
                </div>

                {/* Audio Controls */}
                <div className="audio-controls">
                  <button 
                    className="control-btn"
                    onClick={togglePlayPause}
                    disabled={!response}
                  >
                    {isPlaying ? <Pause /> : <Play />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                  
                  <button 
                    className="control-btn"
                    onClick={stopSpeaking}
                    disabled={!isPlaying}
                  >
                    <Square />
                    Stop
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Quick Questions */}
        <div className="quick-questions">
          <h3>Try asking:</h3>
          <div className="question-chips">
            {[
              "Tell me about Ancient Egypt",
              "What happened during the Renaissance?",
              "Explain the Industrial Revolution",
              "Who was Leonardo da Vinci?",
              "What are the Seven Wonders?"
            ].map((question, index) => (
              <motion.button
                key={index}
                className="question-chip"
                onClick={() => {
                  setTranscript(question);
                  handleQuery(question);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {question}
              </motion.button>
            ))}
          </div>
        </div>

        {/* History Section */}
        <div className="history-section">
          <button 
            className="history-toggle"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History />
            Conversation History ({history.length})
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div 
                className="history-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                {history.length === 0 ? (
                  <p className="empty-history">No conversation history yet</p>
                ) : (
                  <>
                    <div className="history-header">
                      <h4>Recent Conversations</h4>
                      <button onClick={clearHistory} className="clear-btn">
                        Clear All
                      </button>
                    </div>
                    <div className="history-list">
                      {history.map(item => (
                        <motion.div
                          key={item.id}
                          className="history-item"
                          onClick={() => handleHistoryItemClick(item)}
                          whileHover={{ backgroundColor: '#F7FAFC' }}
                        >
                          <div className="history-question">
                            <strong>Q:</strong> {item.question}
                          </div>
                          <div className="history-answer">
                            <strong>A:</strong> {item.answer.substring(0, 100)}...
                          </div>
                          <div className="history-meta">
                            {new Date(item.timestamp).toLocaleString()} • {
                              languages.find(l => l.code === item.language)?.flag
                            }
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style jsx>{`
        .voice-guide-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          padding: 2rem 0;
        }

        .voice-guide-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .voice-guide-header {
          text-align: center;
          color: white;
          margin-bottom: 2rem;
        }

        .voice-guide-header h1 {
          font-size: 2.5rem;
          margin: 1rem 0;
        }

        .voice-guide-header p {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .language-selector {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          background: white;
          padding: 1rem;
          border-radius: 1rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .language-dropdown {
          padding: 0.5rem 1rem;
          border: 2px solid #E2E8F0;
          border-radius: 0.5rem;
          font-size: 1rem;
          cursor: pointer;
        }

        .voice-interface {
          background: white;
          border-radius: 1.5rem;
          padding: 3rem 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          margin-bottom: 2rem;
        }

        .mic-container {
          text-align: center;
          margin-bottom: 2rem;
        }

        .mic-button {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          transition: all 0.3s;
        }

        .mic-button:hover {
          transform: scale(1.05);
        }

        .mic-button.listening {
          background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
        }

        .mic-label {
          margin-top: 1rem;
          font-size: 1.1rem;
          color: #4A5568;
          font-weight: 500;
        }

        .transcript-box,
        .response-box {
          background: #F7FAFC;
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .transcript-box h3,
        .response-box h3 {
          color: #2D3748;
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
        }

        .transcript-box p {
          color: #4A5568;
          font-size: 1.1rem;
          line-height: 1.6;
        }

        .response-content {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .speaker-icon {
          color: #10B981;
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        .response-content p {
          color: #2D3748;
          line-height: 1.8;
          font-size: 1.05rem;
        }

        .audio-controls {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
          justify-content: center;
        }

        .control-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #10B981;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
        }

        .control-btn:hover:not(:disabled) {
          background: #059669;
        }

        .control-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading-indicator {
          text-align: center;
          padding: 2rem;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #E2E8F0;
          border-top-color: #10B981;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .quick-questions {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .quick-questions h3 {
          color: #2D3748;
          margin-bottom: 1rem;
        }

        .question-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .question-chip {
          padding: 0.75rem 1.25rem;
          background: #F7FAFC;
          border: 2px solid #E2E8F0;
          border-radius: 2rem;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
          color: #4A5568;
        }

        .question-chip:hover {
          background: #10B981;
          color: white;
          border-color: #059669;
        }

        .history-section {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .history-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem;
          background: #F7FAFC;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 500;
          color: #4A5568;
          transition: background 0.2s;
        }

        .history-toggle:hover {
          background: #E2E8F0;
        }

        .history-panel {
          overflow: hidden;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 2px solid #E2E8F0;
        }

        .clear-btn {
          padding: 0.5rem 1rem;
          background: #EF4444;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .empty-history {
          text-align: center;
          padding: 2rem;
          color: #A0AEC0;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
          max-height: 400px;
          overflow-y: auto;
        }

        .history-item {
          padding: 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background 0.2s;
          border-left: 4px solid #10B981;
        }

        .history-question {
          color: #2D3748;
          margin-bottom: 0.5rem;
        }

        .history-answer {
          color: #4A5568;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .history-meta {
          color: #A0AEC0;
          font-size: 0.75rem;
        }

        @media (max-width: 768px) {
          .voice-guide-header h1 {
            font-size: 2rem;
          }

          .mic-button {
            width: 100px;
            height: 100px;
          }

          .question-chips {
            flex-direction: column;
          }

          .question-chip {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default VoiceGuide;
