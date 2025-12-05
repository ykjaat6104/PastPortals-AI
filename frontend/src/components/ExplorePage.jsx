import React from 'react';
import { Sparkles, Globe, Landmark, BookOpen, Scroll, Crown, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VoiceSearchBar from './VoiceSearchBar';

const ExplorePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const historicalTopics = [
    {
      id: 1,
      title: 'Indian History',
      icon: Crown,
      description: 'Explore ancient civilizations of the Indus Valley, Mauryan Empire, and Mughal Dynasty',
      gradient: 'from-orange-500 to-pink-500',
      topics: ['Mauryan Empire', 'Mughal Dynasty', 'Indus Valley', 'Vedic Period']
    },
    {
      id: 2,
      title: 'Egyptian Civilization',
      icon: Landmark,
      description: 'Journey through the land of Pharaohs, pyramids, and ancient mysteries',
      gradient: 'from-yellow-500 to-amber-600',
      topics: ['Pyramids', 'Pharaohs', 'Hieroglyphics', 'Nile Valley']
    },
    {
      id: 3,
      title: 'Roman Empire',
      icon: BookOpen,
      description: 'Discover the legacy of Rome, from Republic to Empire',
      gradient: 'from-red-500 to-purple-600',
      topics: ['Julius Caesar', 'Colosseum', 'Roman Law', 'Gladiators']
    },
    {
      id: 4,
      title: 'Chinese Dynasties',
      icon: Scroll,
      description: 'Explore 5000 years of Chinese civilization and culture',
      gradient: 'from-red-600 to-yellow-500',
      topics: ['Great Wall', 'Silk Road', 'Ming Dynasty', 'Terracotta Army']
    },
    {
      id: 5,
      title: 'Greek Mythology',
      icon: Sparkles,
      description: 'Delve into the myths, gods, and legends of ancient Greece',
      gradient: 'from-blue-500 to-cyan-500',
      topics: ['Olympian Gods', 'Trojan War', 'Athens', 'Sparta']
    },
    {
      id: 6,
      title: 'Medieval Europe',
      icon: MapPin,
      description: 'Knights, castles, and the age of chivalry',
      gradient: 'from-gray-600 to-slate-800',
      topics: ['Crusades', 'Knights Templar', 'Renaissance', 'Black Plague']
    }
  ];

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/search', { state: { query: searchQuery, autoSearch: true } });
    }
  };

  const handleTopicClick = (topic) => {
    console.log('🏷️ Tag clicked:', topic);
    navigate('/search', { state: { query: topic, autoSearch: true } });
  };

  return (
    <div className="explore-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <Globe className="title-icon" size={40} />
            Explore History
          </h1>
          <p className="page-subtitle">
            Discover the stories, events, and civilizations that shaped our world
          </p>
        </div>

        <form onSubmit={handleSearch} className="hero-search">
          <VoiceSearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSubmit={handleSearch}
            placeholder="Ask about any historical topic, person, or event..."
            className="hero-search-bar"
          />
        </form>
      </div>

      <div className="topics-grid">
        {historicalTopics.map((topic) => {
          const Icon = topic.icon;
          return (
            <div key={topic.id} className="topic-card">
              <div className={`topic-icon-wrapper bg-gradient-to-br ${topic.gradient}`}>
                <Icon size={32} />
              </div>
              <h3 className="topic-title">{topic.title}</h3>
              <p className="topic-description">{topic.description}</p>
              <div className="topic-tags">
                {topic.topics.map((tag, idx) => (
                  <button
                    key={idx}
                    className="topic-tag"
                    onClick={() => handleTopicClick(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="quick-facts">
        <h2 className="section-title">Did You Know?</h2>
        <div className="facts-grid">
          <div className="fact-card">
            <span className="fact-number">5000+</span>
            <span className="fact-label">Years of Recorded History</span>
          </div>
          <div className="fact-card">
            <span className="fact-number">195</span>
            <span className="fact-label">Countries with Unique Histories</span>
          </div>
          <div className="fact-card">
            <span className="fact-number">1000+</span>
            <span className="fact-label">UNESCO World Heritage Sites</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
