import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Settings, 
  Send, 
  Loader, 
  Globe, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  X,
  Brain,
  Search,
  Clock,
  BookOpen,
  Sparkles
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { apiService } from './utils/api';
import './styles/globals.css';

// Quick question templates for world history
const quickQuestions = [
  {
    icon: "🏛️",
    title: "Ancient Rome",
    question: "Tell me about the Roman Empire and its impact on world history"
  },
  {
    icon: "🏺", 
    title: "Ancient Egypt",
    question: "What were the major achievements of Ancient Egyptian civilization?"
  },
  {
    icon: "⚔️",
    title: "Medieval Europe",
    question: "Describe the major events and characteristics of Medieval Europe"
  },
  {
    icon: "🏯",
    title: "Feudal Japan",
    question: "Tell me about the samurai culture and feudal system in Japan"
  },
  {
    icon: "🗿",
    title: "Renaissance",
    question: "What were the key developments during the Renaissance period?"
  },
  {
    icon: "🌍",
    title: "Age of Exploration",
    question: "How did the Age of Exploration change world history?"
  },
  {
    icon: "🏰",
    title: "Great Wall of China",
    question: "Tell me about the construction and significance of the Great Wall of China"
  },
  {
    icon: "🕌",
    title: "Islamic Golden Age",
    question: "What were the major contributions during the Islamic Golden Age?"
  }
];

// Language options for translation
const languages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi',
  'Bengali', 'Urdu', 'Tamil', 'Telugu', 'Marathi', 'Gujarati'
];

function App() {
  // State management
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(false);
  const [serverStatus, setServerStatus] = useState(null);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [translation, setTranslation] = useState(null);
  const [summary, setSummary] = useState(null);
  const [translationLanguage, setTranslationLanguage] = useState('Spanish');
  const [processingTranslation, setProcessingTranslation] = useState(false);
  const [processingSummary, setProcessingSummary] = useState(false);

  // Check server health on component mount
  useEffect(() => {
    checkServerHealth();
  }, []);

  const checkServerHealth = async () => {
    try {
      const health = await apiService.checkHealth();
      setServerStatus(health);
      setApiConfigured(health.ai_configured);
    } catch (error) {
      console.error('Server health check failed:', error);
      setServerStatus({ status: 'offline', error: error.message });
    }
  };

  const handleApiConfiguration = async () => {
    if (!apiKey.trim()) {
      alert('Please enter a valid API key');
      return;
    }

    setLoading(true);
    try {
      await apiService.configureAPI(apiKey);
      setApiConfigured(true);
      setShowApiConfig(false);
      setApiKey(''); // Clear the key from state for security
      await checkServerHealth(); // Refresh status
    } catch (error) {
      alert(`Configuration failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSubmit = async (questionText = null) => {
    const queryText = questionText || question.trim();
    
    if (!queryText) {
      alert('Please enter a question');
      return;
    }

    setLoading(true);
    setResponse(null);
    setTranslation(null);
    setSummary(null);

    try {
      const result = await apiService.askQuestion(queryText);
      setResponse(result);
      if (questionText) setQuestion(questionText); // Update question state if using quick question
    } catch (error) {
      setResponse({
        answer: `❌ **Error**: ${error.message}`,
        source: 'error',
        wikipedia_info: null
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTranslation = async () => {
    if (!response?.answer) return;

    setProcessingTranslation(true);
    try {
      const result = await apiService.translateText(response.answer, translationLanguage);
      setTranslation(result);
    } catch (error) {
      alert(`Translation failed: ${error.message}`);
    } finally {
      setProcessingTranslation(false);
    }
  };

  const handleSummarization = async () => {
    if (!response?.answer) return;

    setProcessingSummary(true);
    try {
      const result = await apiService.summarizeText(response.answer);
      setSummary(result);
    } catch (error) {
      alert(`Summarization failed: ${error.message}`);
    } finally {
      setProcessingSummary(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-lg border-b border-slate-200"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Museum Guide
                </h1>
                <p className="text-sm text-slate-600">Explore World History with Intelligence</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-4">
              {/* Status Indicators */}
              <div className="hidden md:flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${serverStatus?.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-slate-600">Server</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${apiConfigured ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="text-slate-600">AI</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowApiConfig(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Configure API</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-6 py-8">
        {/* Quick Questions Section */}
        <motion.section 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              <Sparkles className="inline-block w-6 h-6 mr-2 text-purple-600" />
              Explore World History
            </h2>
            <p className="text-slate-600">Click on any topic below to start your historical journey</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickQuestions.map((item, index) => (
              <motion.button
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuestionSubmit(item.question)}
                disabled={loading}
                className="bg-white rounded-xl p-4 text-left shadow-md hover:shadow-lg transition-all duration-200 border border-slate-200 disabled:opacity-50"
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <h3 className="font-semibold text-slate-800 mb-1">{item.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2">{item.question}</p>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Question Input Section */}
        <motion.section 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-800">Ask Your Historical Question</h3>
            </div>
            
            <div className="flex gap-3">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && handleQuestionSubmit()}
                placeholder="e.g., Tell me about the Fall of the Roman Empire..."
                className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                disabled={loading}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuestionSubmit()}
                disabled={loading || !question.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                <span className="hidden sm:inline">{loading ? 'Processing...' : 'Ask'}</span>
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-8"
            >
              <div className="inline-flex items-center gap-3 text-blue-600">
                <Loader className="w-6 h-6 animate-spin" />
                <span className="text-lg font-medium">Exploring historical archives...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Response Section */}
        <AnimatePresence>
          {response && !loading && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="mb-8"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                {/* Response Header */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Brain className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-slate-800">Historical Response</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        response.source === 'ai' ? 'bg-green-100 text-green-800' : 
                        response.source === 'fallback' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {response.source === 'ai' ? 'AI Powered' : 
                         response.source === 'fallback' ? 'Wikipedia' : 'Error'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4" />
                      {response.timestamp && formatTimestamp(response.timestamp)}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Main Response */}
                  <div className="prose prose-slate max-w-none mb-6">
                    <ReactMarkdown 
                      components={{
                        h1: ({children}) => <h1 className="text-2xl font-bold text-slate-800 mb-4">{children}</h1>,
                        h2: ({children}) => <h2 className="text-xl font-semibold text-slate-700 mb-3 mt-6">{children}</h2>,
                        h3: ({children}) => <h3 className="text-lg font-medium text-slate-700 mb-2 mt-4">{children}</h3>,
                        p: ({children}) => <p className="text-slate-600 mb-4 leading-relaxed">{children}</p>,
                        ul: ({children}) => <ul className="list-disc list-inside text-slate-600 mb-4 space-y-1">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal list-inside text-slate-600 mb-4 space-y-1">{children}</ol>,
                        strong: ({children}) => <strong className="font-semibold text-slate-800">{children}</strong>,
                        blockquote: ({children}) => <blockquote className="border-l-4 border-blue-200 pl-4 italic text-slate-600 my-4">{children}</blockquote>
                      }}
                    >
                      {response.answer}
                    </ReactMarkdown>
                  </div>

                  {/* Wikipedia Info */}
                  {response.wikipedia_info && (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mb-6">
                      <div className="flex items-start gap-3">
                        {response.wikipedia_info.thumbnail && (
                          <img 
                            src={response.wikipedia_info.thumbnail} 
                            alt={response.wikipedia_info.title}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800 mb-2">
                            📖 {response.wikipedia_info.title}
                          </h4>
                          <p className="text-sm text-slate-600 mb-3 line-clamp-3">
                            {response.wikipedia_info.extract}
                          </p>
                          <a 
                            href={response.wikipedia_info.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Read more on Wikipedia →
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-3">
                      <select
                        value={translationLanguage}
                        onChange={(e) => setTranslationLanguage(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        {languages.map(lang => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleTranslation}
                        disabled={processingTranslation || !apiConfigured}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {processingTranslation ? <Loader className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                        Translate
                      </motion.button>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSummarization}
                      disabled={processingSummary || !apiConfigured}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {processingSummary ? <Loader className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                      Summarize
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Translation Result */}
        <AnimatePresence>
          {translation && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-slate-800">
                    Translation ({translation.target_language})
                  </h3>
                </div>
                <div className="prose prose-slate max-w-none">
                  <ReactMarkdown>{translation.translated_text}</ReactMarkdown>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Summary Result */}
        <AnimatePresence>
          {summary && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-slate-800">Summary</h3>
                  <span className="text-sm text-slate-500">
                    ({summary.summary_length} words from {summary.original_length})
                  </span>
                </div>
                <div className="prose prose-slate max-w-none">
                  <ReactMarkdown>{summary.summary}</ReactMarkdown>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* API Configuration Modal */}
      <AnimatePresence>
        {showApiConfig && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowApiConfig(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800">Configure AI API</h3>
                <button
                  onClick={() => setShowApiConfig(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-slate-600 mb-4">
                Enter your Google Gemini API key to enable AI-powered responses:
              </p>

              <div className="mb-4">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleApiConfiguration}
                  disabled={loading || !apiKey.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? <Loader className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  Configure
                </motion.button>
                <button
                  onClick={() => setShowApiConfig(false)}
                  className="px-4 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-800">
                  <BookOpen className="inline w-4 h-4 mr-1" />
                  Get your free API key from{' '}
                  <a 
                    href="https://makersuite.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium underline hover:no-underline"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p className="text-slate-600 mb-2">
              🏛️ AI Museum Guide - Powered by Advanced AI Technology
            </p>
            <p className="text-sm text-slate-500">
              Explore the fascinating world of history with intelligent assistance
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;