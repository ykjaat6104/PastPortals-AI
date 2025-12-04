import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  Globe, 
  Clock, 
  Users, 
  BookOpen,
  Zap,
  Shield
} from 'lucide-react';
import QuickQuestions from './QuickQuestions';

const Home = () => {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Intelligence',
      description: 'Get comprehensive answers powered by Google Gemini AI with worldwide historical knowledge.',
      color: 'var(--primary-500)'
    },
    {
      icon: Globe,
      title: 'Global History Coverage',
      description: 'Explore civilizations, empires, and events from every continent and time period.',
      color: 'var(--secondary-500)'
    },
    {
      icon: Clock,
      title: 'Real-Time Research',
      description: 'Access up-to-date information with Wikipedia integration and live historical data.',
      color: 'var(--accent-500)'
    },
    {
      icon: Users,
      title: 'Multi-Language Support',
      description: 'Translate responses to 18+ languages for global accessibility.',
      color: 'var(--primary-600)'
    }
  ];

  const stats = [
    { label: 'Historical Periods Covered', value: '5000+', icon: BookOpen },
    { label: 'Response Time', value: '<3s', icon: Zap },
    { label: 'Accuracy Rate', value: '95%', icon: Shield },
    { label: 'Languages Supported', value: '18+', icon: Globe }
  ];

  return (
    <motion.div 
      className="home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <motion.div
              className="hero-text"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1 
                className="hero-title"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Explore World History with 
                <span className="gradient-text"> AI Intelligence</span>
              </motion.h1>
              
              <motion.p 
                className="hero-description"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Your intelligent companion for discovering the fascinating stories, 
                civilizations, and events that shaped our world. From ancient empires 
                to modern history, get comprehensive answers powered by advanced AI.
              </motion.p>

              <motion.div 
                className="hero-actions"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <Link to="/explore" className="btn btn-primary btn-large">
                  Start Exploring
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a href="#features" className="btn btn-secondary btn-large">
                  Learn More
                </a>
              </motion.div>
            </motion.div>

            <motion.div
              className="hero-visual"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
            >
              <div className="hero-image">
                <motion.div
                  className="floating-element"
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  🏛️
                </motion.div>
                <motion.div
                  className="floating-element floating-element-2"
                  animate={{ y: [10, -10, 10] }}
                  transition={{ repeat: Infinity, duration: 3, delay: 1 }}
                >
                  📜
                </motion.div>
                <motion.div
                  className="floating-element floating-element-3"
                  animate={{ y: [-5, 15, -5] }}
                  transition={{ repeat: Infinity, duration: 3, delay: 2 }}
                >
                  🗿
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="stat-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
              >
                <stat.icon className="stat-icon" />
                <div className="stat-content">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>Powerful Features for Historical Discovery</h2>
            <p>Experience history like never before with our advanced AI-powered platform</p>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.8 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                onHoverStart={() => setHoveredFeature(index)}
                onHoverEnd={() => setHoveredFeature(null)}
              >
                <div className="feature-icon" style={{ color: feature.color }}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <div className="feature-content">
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
                <motion.div
                  className="feature-hover-effect"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: hoveredFeature === index ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Questions Section */}
      <section className="quick-questions-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>Start with Popular Questions</h2>
            <p>Try these fascinating historical topics to begin your journey</p>
          </motion.div>
          
          <QuickQuestions />
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <motion.div 
            className="cta-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>Ready to Explore History?</h2>
            <p>Join thousands of history enthusiasts discovering the past with AI assistance</p>
            <Link to="/explore" className="btn btn-primary btn-large">
              Begin Your Journey
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;