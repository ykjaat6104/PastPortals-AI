import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Search } from 'lucide-react';

const VoiceSearchBar = ({ 
  value, 
  onChange, 
  onSubmit, 
  placeholder = "Search or speak...",
  className = ""
}) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      recognitionInstance.maxAlternatives = 1;

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('🎤 Voice captured:', transcript);
        onChange({ target: { value: transcript } });
      };

      recognitionInstance.onerror = (event) => {
        console.log('Voice error:', event.error);
        
        if (event.error === 'network') {
          // Network error in Brave - show helpful message
          alert('⚠️ Voice recognition needs internet in Brave.\n\nOptions:\n1. Check your internet connection\n2. Try again in a few seconds\n3. Or just type your search manually');
        } else if (event.error === 'not-allowed') {
          alert('🎤 Microphone access needed.\n\nPlease allow microphone in your browser settings.');
        } else if (event.error === 'no-speech') {
          console.log('No speech detected, please try again');
        }
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        console.log('🎤 Recognition ended');
        setIsListening(false);
      };
      
      recognitionInstance.onstart = () => {
        console.log('🎤 Recognition started - Speak now!');
        setIsListening(true);
      };

      recognitionRef.current = recognitionInstance;
    } else {
      console.warn('Speech recognition not supported');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [onChange]);

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    
    if (!recognition) {
      alert('⚠️ Voice recognition is not supported in your browser.\n\nPlease use:\n• Chrome\n• Edge\n• Safari\n\nOr type your search manually.');
      return;
    }

    if (isListening) {
      // Stop listening
      console.log('🛑 Stopping voice recognition...');
      try {
        recognition.stop();
      } catch (error) {
        console.error('Error stopping:', error);
      }
      setIsListening(false);
    } else {
      // Start listening
      console.log('🎙️ Starting voice recognition...');
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
        // If error is "already started", stop first then restart
        if (error.message && error.message.includes('started')) {
          try {
            recognition.stop();
            setTimeout(() => {
              try {
                recognition.start();
                setIsListening(true);
              } catch (e) {
                console.error('Retry failed:', e);
                setIsListening(false);
              }
            }, 200);
          } catch (e) {
            console.error('Stop failed:', e);
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      }
    }
  };

  const handleSearchClick = () => {
    if (onSubmit && value.trim()) {
      onSubmit({ preventDefault: () => {} });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <div className={`voice-search-bar ${className}`}>
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="voice-search-input"
      />
      <button
        type="button"
        className={`voice-btn ${isListening ? 'listening' : ''}`}
        onClick={toggleListening}
        title={isListening ? 'Click to stop listening' : 'Click to start voice input'}
      >
        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        {isListening && <span className="pulse-ring"></span>}
      </button>
      <button
        type="button"
        className="search-btn"
        onClick={handleSearchClick}
        title="Search"
      >
        <Search size={20} />
      </button>
    </div>
  );
};

export default VoiceSearchBar;
