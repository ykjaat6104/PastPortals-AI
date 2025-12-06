import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, ExternalLink, Loader2, CheckCircle } from 'lucide-react';
import { useAPI } from '../contexts/APIContext';

const ConfigModal = ({ isOpen, onClose }) => {
  const { configureAPI, resetConfiguration, isLoading, isConfigured, apiKey } = useAPI();
  const [inputApiKey, setInputApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInputApiKey(apiKey || '');
      setShowApiKey(false);
    }
  }, [isOpen, apiKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await configureAPI(inputApiKey);
    if (success) {
      onClose();
    }
  };

  const handleReset = () => {
    resetConfiguration();
    setInputApiKey('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-content"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <div className="modal-title">
              <Key className="w-5 h-5" />
              <h3>API Configuration</h3>
              {isConfigured && <CheckCircle className="w-5 h-5 text-success-500" />}
            </div>
            <button className="modal-close" onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body">
            <form onSubmit={handleSubmit} className="config-form">
              <div className="form-group">
                <label htmlFor="apiKey">Google Gemini API Key</label>
                <div className="input-group">
                  <input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    value={inputApiKey}
                    onChange={(e) => setInputApiKey(e.target.value)}
                    placeholder="Enter your Gemini API key..."
                    className="form-input"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    className="input-toggle"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Status */}
              {isConfigured && (
                <motion.div
                  className="config-status success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>API configured successfully</span>
                </motion.div>
              )}

              {/* Help Text */}
              <div className="help-text">
                <p>
                  Your API key is stored securely in your browser and never sent to our servers.
                </p>
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="help-link"
                >
                  <ExternalLink className="w-4 h-4" />
                  Get your free API key from Google AI Studio
                </a>
              </div>

              {/* Actions */}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading || !inputApiKey.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Configuring...
                    </>
                  ) : (
                    'Save Configuration'
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfigModal;