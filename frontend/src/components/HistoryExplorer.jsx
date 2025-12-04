import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { 
  Send, 
  Loader2, 
  MessageCircle, 
  Globe, 
  FileText,
  Search,
  Clock,
  ExternalLink,
  Languages
} from 'lucide-react';
import { useAPI } from '../contexts/APIContext';
import { useNotification } from '../contexts/NotificationContext';

const HistoryExplorer = () => {
  const location = useLocation();
  const { askQuestion, translateText, summarizeText, isConfigured, isLoading } = useAPI();
  const { showSuccess, showError, showInfo, showLoading, dismissLoading } = useNotification();

  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [translation, setTranslation] = useState(null);
  const [summary, setSummary] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('Spanish');

  const languages = [
    'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
    'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Bengali',
    'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Urdu', 'Punjabi'
  ];

  useEffect(() => {
    // Handle navigation with auto-ask functionality
    if (location.state?.question && location.state?.autoAsk && isConfigured) {
      setQuestion(location.state.question);
      handleAskQuestion(location.state.question);
    } else if (location.state?.question) {
      setQuestion(location.state.question);
    }
  }, [location.state, isConfigured]);

  const handleAskQuestion = async (questionText = question) => {
    if (!questionText.trim()) {
      showError('Please enter a question');
      return;
    }

    if (!isConfigured) {
      showError('Please configure your API key first');
      return;
    }

    setIsProcessing(true);
    setResponse(null);
    setTranslation(null);
    setSummary(null);
    setShowTranslation(false);
    setShowSummary(false);

    const loadingToast = showLoading('Processing your historical question...');

    try {
      const result = await askQuestion(questionText);
      setResponse(result);
      showSuccess('Response generated successfully!');
    } catch (error) {
      showError(error.message || 'Failed to get response');
      console.error('Question error:', error);
    } finally {
      setIsProcessing(false);
      dismissLoading(loadingToast);
    }
  };

  const handleTranslate = async () => {
    if (!response?.answer) return;

    const loadingToast = showLoading(`Translating to ${selectedLanguage}...`);

    try {
      const result = await translateText(response.answer, selectedLanguage);
      setTranslation(result);
      setShowTranslation(true);
      showSuccess('Translation completed!');
    } catch (error) {
      showError(error.message || 'Translation failed');
    } finally {
      dismissLoading(loadingToast);
    }
  };

  const handleSummarize = async () => {
    if (!response?.answer) return;

    const loadingToast = showLoading('Creating summary...');

    try {
      const result = await summarizeText(response.answer);
      setSummary(result);
      setShowSummary(true);
      showSuccess('Summary generated!');
    } catch (error) {
      showError(error.message || 'Summarization failed');
    } finally {
      dismissLoading(loadingToast);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAskQuestion();
  };

  return (
    <motion.div 
      className="explorer-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container">
        {/* Header */}
        <motion.div 
          className="explorer-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <h1>History Explorer</h1>
          <p>Ask any question about world history and get comprehensive AI-powered answers</p>
        </motion.div>

        {/* Question Form */}
        <motion.div 
          className="question-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <form onSubmit={handleSubmit} className="question-form">
            <div className="question-input-group">
              <Search className="input-icon" />
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about any historical event, person, or civilization..."
                className="question-input"
                disabled={isProcessing}
              />
              <button
                type="submit"
                className="question-submit"
                disabled={isProcessing || !question.trim() || !isConfigured}
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>

          {!isConfigured && (
            <motion.div 
              className="config-notice"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <MessageCircle className="w-5 h-5" />
              <span>Configure your API key to start asking questions</span>
            </motion.div>
          )}
        </motion.div>

        {/* Response Section */}
        <AnimatePresence mode="wait">
          {response && (
            <motion.div 
              className="response-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
            >
              {/* Response Header */}
              <div className="response-header">
                <div className="response-meta">
                  <Clock className="w-4 h-4" />
                  <span>Response generated at {new Date(response.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="response-source">
                  <span className="source-badge">{response.source === 'ai' ? 'AI Powered' : 'Wikipedia'}</span>
                </div>
              </div>

              {/* Main Response */}
              <div className="response-content">
                <div className="response-text">
                  <ReactMarkdown>{response.answer}</ReactMarkdown>
                </div>

                {/* Wikipedia Info */}
                {response.wikipedia_info && (
                  <div className="wikipedia-section">
                    <h4>Additional Information</h4>
                    <div className="wikipedia-content">
                      <div className="wikipedia-text">
                        <h5>{response.wikipedia_info.title}</h5>
                        <p>{response.wikipedia_info.extract}</p>
                        {response.wikipedia_info.url && (
                          <a 
                            href={response.wikipedia_info.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="wikipedia-link"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Read more on Wikipedia
                          </a>
                        )}
                      </div>
                      {response.wikipedia_info.thumbnail && (
                        <img 
                          src={response.wikipedia_info.thumbnail} 
                          alt={response.wikipedia_info.title}
                          className="wikipedia-image"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="response-actions">
                <div className="action-group">
                  <select 
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="language-select"
                  >
                    {languages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleTranslate}
                    className="btn btn-secondary"
                    disabled={isLoading}
                  >
                    <Languages className="w-4 h-4" />
                    Translate
                  </button>
                </div>

                <button
                  onClick={handleSummarize}
                  className="btn btn-secondary"
                  disabled={isLoading}
                >
                  <FileText className="w-4 h-4" />
                  Summarize
                </button>
              </div>

              {/* Translation Section */}
              <AnimatePresence>
                {showTranslation && translation && (
                  <motion.div 
                    className="translation-section"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <h4>Translation ({selectedLanguage})</h4>
                    <div className="translation-content">
                      <ReactMarkdown>{translation.translated_text}</ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Summary Section */}
              <AnimatePresence>
                {showSummary && summary && (
                  <motion.div 
                    className="summary-section"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <h4>Summary</h4>
                    <div className="summary-content">
                      <ReactMarkdown>{summary.summary}</ReactMarkdown>
                      <div className="summary-stats">
                        <span>Original: {summary.original_length} words</span>
                        <span>•</span>
                        <span>Summary: {summary.summary_length} words</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div 
              className="loading-section"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="loading-content">
                <Loader2 className="loading-spinner" />
                <h3>Researching Historical Information</h3>
                <p>Analyzing your question and gathering comprehensive historical data...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default HistoryExplorer;