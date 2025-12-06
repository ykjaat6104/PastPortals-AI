import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Globe, 
  BookOpen, 
  Zap,
  Users,
  Award,
  Github,
  Mail
} from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Brain,
      title: 'Advanced AI Intelligence',
      description: 'Powered by Google Gemini AI for accurate and comprehensive historical responses.'
    },
    {
      icon: Globe,
      title: 'Global Historical Coverage',
      description: 'Explore civilizations, empires, and events from every continent and time period.'
    },
    {
      icon: BookOpen,
      title: 'Educational Excellence',
      description: 'Designed for students, educators, and history enthusiasts of all levels.'
    },
    {
      icon: Zap,
      title: 'Real-time Research',
      description: 'Access up-to-date information with Wikipedia integration and live data.'
    }
  ];

  const stats = [
    { number: '5000+', label: 'Historical Topics', icon: BookOpen },
    { number: '18+', label: 'Languages Supported', icon: Globe },
    { number: '<3s', label: 'Average Response Time', icon: Zap },
    { number: '95%', label: 'Accuracy Rate', icon: Award }
  ];

  const teamMembers = [
    {
      name: 'AI Research Team',
      role: 'Historical AI Development',
      description: 'Developing advanced AI models for historical education'
    },
    {
      name: 'History Experts',
      role: 'Content Validation',
      description: 'Ensuring historical accuracy and comprehensive coverage'
    },
    {
      name: 'UX Designers',
      role: 'User Experience',
      description: 'Creating intuitive and engaging learning interfaces'
    }
  ];

  return (
    <motion.div 
      className="about-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <motion.div 
            className="about-hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1>About PastPortals</h1>
            <p className="hero-subtitle">
              Revolutionizing historical education through artificial intelligence, 
              making world history accessible, engaging, and comprehensive for everyone.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <motion.div 
            className="mission-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="mission-text">
              <h2>Our Mission</h2>
              <p>
                We believe that understanding history is crucial for understanding our present 
                and shaping our future. PastPortals democratizes access to historical 
                knowledge by providing intelligent, comprehensive, and engaging responses to 
                historical inquiries from around the world.
              </p>
              <p>
                By combining cutting-edge AI technology with carefully curated historical 
                data, we create an educational experience that adapts to each learner's needs, 
                making history more accessible than ever before.
              </p>
            </div>
            <div className="mission-visual">
              <motion.div 
                className="mission-icon"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                [Museum]
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="about-features">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>What Makes Us Special</h2>
            <p>Combining advanced AI with historical expertise for the best learning experience</p>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="about-feature-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.8 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="feature-icon">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="about-stats">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>By the Numbers</h2>
            <p>Our impact on historical education</p>
          </motion.div>

          <div className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="about-stat-card"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <stat.icon className="stat-icon" />
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="technology-section">
        <div className="container">
          <motion.div 
            className="technology-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="technology-text">
              <h2>Cutting-Edge Technology</h2>
              <p>
                Our platform leverages the latest advances in artificial intelligence, 
                including Google's Gemini AI, to provide accurate and contextual historical 
                information.
              </p>
              <div className="tech-features">
                <div className="tech-feature">
                  <strong>Natural Language Processing:</strong> Understands questions in natural language
                </div>
                <div className="tech-feature">
                  <strong>Multi-source Integration:</strong> Combines AI knowledge with Wikipedia data
                </div>
                <div className="tech-feature">
                  <strong>Real-time Translation:</strong> Supports 18+ languages for global accessibility
                </div>
                <div className="tech-feature">
                  <strong>Contextual Understanding:</strong> Provides comprehensive, contextual responses
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>Our Team</h2>
            <p>Dedicated professionals working to make history accessible</p>
          </motion.div>

          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                className="team-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.8 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="team-avatar">
                  <Users className="w-8 h-8" />
                </div>
                <h3>{member.name}</h3>
                <h4>{member.role}</h4>
                <p>{member.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <motion.div 
            className="contact-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>Get In Touch</h2>
            <p>Have questions, suggestions, or feedback? We'd love to hear from you!</p>
            
            <div className="contact-links">
              <a href="mailto:hello@aimuseumguide.com" className="contact-link">
                <Mail className="w-5 h-5" />
                <span>hello@aimuseumguide.com</span>
              </a>
              <a 
                href="https://github.com/ykjaat6104/Ai-Museum-Guide" 
                target="_blank" 
                rel="noopener noreferrer"
                className="contact-link"
              >
                <Github className="w-5 h-5" />
                <span>View on GitHub</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default About;