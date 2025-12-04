import React, { useState, useEffect } from 'react';
import './styles/globals.css';
import './styles/components.css';

// Simple HomePage component
const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Explore World History with 
                <span className="gradient-text"> AI Intelligence</span>
              </h1>
              
              <p className="hero-description">
                Your intelligent companion for discovering the fascinating stories, 
                civilizations, and events that shaped our world. From ancient empires 
                to modern history, get comprehensive answers powered by advanced AI.
              </p>

              <div className="hero-actions">
                <button className="btn btn-primary btn-large">
                  Start Exploring
                  <span>→</span>
                </button>
                <button className="btn btn-secondary btn-large">
                  Learn More
                </button>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-image">
                <div className="floating-element">🏛️</div>
                <div className="floating-element floating-element-2">📜</div>
                <div className="floating-element floating-element-3">🗿</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Powerful Features for Historical Discovery</h2>
            <p>Experience history like never before with our advanced AI-powered platform</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <div className="feature-content">
                <h3 className="feature-title">AI-Powered Intelligence</h3>
                <p className="feature-description">
                  Get comprehensive answers powered by Google Gemini AI with worldwide historical knowledge.
                </p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <div className="feature-content">
                <h3 className="feature-title">Global History Coverage</h3>
                <p className="feature-description">
                  Explore civilizations, empires, and events from every continent and time period.
                </p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <div className="feature-content">
                <h3 className="feature-title">Real-Time Research</h3>
                <p className="feature-description">
                  Access up-to-date information with Wikipedia integration and live historical data.
                </p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <div className="feature-content">
                <h3 className="feature-title">Multi-Language Support</h3>
                <p className="feature-description">
                  Translate responses to 18+ languages for global accessibility.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Questions */}
      <section className="quick-questions-section">
        <div className="container">
          <div className="section-header">
            <h2>Start with Popular Questions</h2>
            <p>Try these fascinating historical topics to begin your journey</p>
          </div>
          
          <div className="questions-grid">
            {[
              { text: "Tell me about the Roman Empire", icon: "🏛️", category: "Ancient Civilizations" },
              { text: "How were the Egyptian pyramids built?", icon: "🔺", category: "Ancient Wonders" },
              { text: "What was life like in medieval Europe?", icon: "🏰", category: "Medieval Period" },
              { text: "What caused World War II?", icon: "⚔️", category: "Modern History" },
              { text: "Tell me about the Renaissance period", icon: "🎨", category: "Cultural Movements" },
              { text: "Why was the Great Wall of China built?", icon: "🏔️", category: "Engineering Marvels" }
            ].map((question, index) => (
              <button key={index} className="question-card" style={{background: `linear-gradient(135deg, #3b82f6, #8b5cf6)`}}>
                <div className="question-icon">
                  <span style={{fontSize: '1.5rem'}}>{question.icon}</span>
                </div>
                <div className="question-content">
                  <span className="question-category">{question.category}</span>
                  <span className="question-text">{question.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Explore History?</h2>
            <p>Join thousands of history enthusiasts discovering the past with AI assistance</p>
            <button className="btn btn-primary btn-large">
              Begin Your Journey
              <span>→</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

// Simple Header
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <div className="logo">
            <div className="logo-icon">🏛️</div>
            <div className="logo-text">
              <h1>AI Museum Guide</h1>
              <span className="tagline">Explore World History</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="nav-desktop">
            <a href="#" className="nav-link active">🏠 Home</a>
            <a href="#" className="nav-link">🧭 Explore</a>
            <a href="#" className="nav-link">ℹ️ About</a>
          </nav>

          {/* Status & Actions */}
          <div className="header-actions">
            {/* Status Indicator */}
            <div className="status-indicator">
              <span>📡</span>
              <span className="status-text">Setup Required</span>
            </div>

            {/* Config Button */}
            <button className="btn btn-primary">
              <span>⚙️</span>
              <span className="mobile-hidden">Configure</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="nav-mobile">
            <div className="nav-mobile-content">
              <a href="#" className="nav-link-mobile active">🏠 Home</a>
              <a href="#" className="nav-link-mobile">🧭 Explore</a>
              <a href="#" className="nav-link-mobile">ℹ️ About</a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

// Main App Component
function App() {
  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <HomePage />
      </main>
    </div>
  );
}

export default App;