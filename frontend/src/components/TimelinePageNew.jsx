import React, { useState } from 'react';
import { Clock, ChevronRight, Calendar } from 'lucide-react';
import VoiceSearchBar from './VoiceSearchBar';
import { useAPI } from '../contexts/APIContext';

const TimelinePageNew = () => {
  const { askQuestion } = useAPI();
  const [selectedTimeline, setSelectedTimeline] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [searching, setSearching] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const timelines = [
    {
      id: 'indian',
      name: 'Indian History',
      flag: '🇮🇳',
      color: 'from-orange-500 to-green-600',
      periods: [
        { year: '3300 BCE', event: 'Indus Valley Civilization', description: 'One of the world\'s earliest urban civilizations' },
        { year: '1500 BCE', event: 'Vedic Period', description: 'Composition of the Vedas and rise of Hinduism' },
        { year: '322 BCE', event: 'Mauryan Empire', description: 'Chandragupta Maurya founds the empire' },
        { year: '1526 CE', event: 'Mughal Empire', description: 'Babur establishes Mughal dynasty' },
        { year: '1947 CE', event: 'Independence', description: 'India gains independence from British rule' }
      ]
    },
    {
      id: 'egyptian',
      name: 'Egyptian History',
      flag: '🇪🇬',
      color: 'from-yellow-600 to-amber-700',
      periods: [
        { year: '3100 BCE', event: 'Early Dynastic Period', description: 'Unification of Upper and Lower Egypt' },
        { year: '2686 BCE', event: 'Old Kingdom', description: 'Age of the Pyramids - Great Pyramid of Giza built' },
        { year: '2055 BCE', event: 'Middle Kingdom', description: 'Golden age of art and literature' },
        { year: '1550 BCE', event: 'New Kingdom', description: 'Egypt reaches peak power - Tutankhamun reigns' },
        { year: '30 BCE', event: 'Roman Conquest', description: 'Cleopatra\'s death marks end of Ptolemaic rule' }
      ]
    },
    {
      id: 'roman',
      name: 'Roman Empire',
      flag: '🏛️',
      color: 'from-red-600 to-purple-700',
      periods: [
        { year: '753 BCE', event: 'Founding of Rome', description: 'Legendary founding by Romulus' },
        { year: '509 BCE', event: 'Roman Republic', description: 'Overthrow of monarchy, republic established' },
        { year: '27 BCE', event: 'Roman Empire Begins', description: 'Augustus becomes first emperor' },
        { year: '117 CE', event: 'Greatest Extent', description: 'Empire reaches maximum territorial expansion' },
        { year: '476 CE', event: 'Fall of Western Rome', description: 'End of the Western Roman Empire' }
      ]
    },
    {
      id: 'chinese',
      name: 'Chinese Dynasties',
      flag: '🇨🇳',
      color: 'from-red-700 to-yellow-500',
      periods: [
        { year: '2070 BCE', event: 'Xia Dynasty', description: 'First dynasty in traditional Chinese historiography' },
        { year: '221 BCE', event: 'Qin Dynasty', description: 'First unified Chinese empire, Great Wall construction' },
        { year: '618 CE', event: 'Tang Dynasty', description: 'Golden age of Chinese culture and arts' },
        { year: '1368 CE', event: 'Ming Dynasty', description: 'Era of maritime exploration and cultural renaissance' },
        { year: '1912 CE', event: 'End of Imperial China', description: 'Qing Dynasty falls, Republic established' }
      ]
    },
    {
      id: 'greek',
      name: 'Ancient Greece',
      flag: '🇬🇷',
      color: 'from-blue-600 to-cyan-500',
      periods: [
        { year: '3000 BCE', event: 'Minoan Civilization', description: 'Bronze Age civilization on Crete' },
        { year: '800 BCE', event: 'Archaic Period', description: 'Rise of city-states and Greek alphabet' },
        { year: '480 BCE', event: 'Classical Period', description: 'Golden age - Pericles, Socrates, Plato' },
        { year: '336 BCE', event: 'Alexander the Great', description: 'Macedonian conquest and Hellenistic spread' },
        { year: '146 BCE', event: 'Roman Conquest', description: 'Greece becomes Roman province' }
      ]
    },
    {
      id: 'mesopotamian',
      name: 'Mesopotamian History',
      flag: '🏺',
      color: 'from-amber-600 to-orange-700',
      periods: [
        { year: '3500 BCE', event: 'Sumerian Civilization', description: 'Invention of writing (cuneiform)' },
        { year: '2334 BCE', event: 'Akkadian Empire', description: 'First empire in history under Sargon' },
        { year: '1792 BCE', event: 'Babylonian Empire', description: 'Hammurabi\'s Code of Laws' },
        { year: '911 BCE', event: 'Assyrian Empire', description: 'Powerful military empire' },
        { year: '539 BCE', event: 'Persian Conquest', description: 'Fall of Babylon to Cyrus the Great' }
      ]
    }
  ];

  const visibleTimelines = showMore ? timelines : timelines.slice(0, 3);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setSearching(true);
      setSearchResult('');
      try {
        const prompt = `Provide a detailed timeline and historical information about ${searchQuery}. Include key dates, events, and significance in world history. Use Wikipedia and historical sources.`;
        const response = await askQuestion(prompt);
        setSearchResult(response);
      } catch (error) {
        console.error('Timeline search error:', error);
        setSearchResult('Sorry, could not find timeline information. Please check your connection and try again.');
      } finally {
        setSearching(false);
      }
    }
  };

  return (
    <div className="timeline-page">
      <div className="timeline-header">
        <h1 className="page-title">
          <Clock size={36} />
          Historical Timelines
        </h1>
        <p className="page-subtitle">
          Explore major civilizations and their defining moments in history
        </p>
      </div>

      <div className="timeline-search">
        <VoiceSearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSubmit={handleSearch}
          placeholder="Search for a specific period or event..."
          className="timeline-search-bar"
        />
      </div>

      {searching && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>⏳ Searching through time...</p>
          <small>Powered by Google Gemini</small>
        </div>
      )}

      {searchResult && !searching && (
        <div className="timeline-search-result">
          <div className="result-header">
            <h2>Timeline Information</h2>
          </div>
          <div className="result-content">
            <p className="answer-text">{searchResult}</p>
          </div>
        </div>
      )}

      <div className="timelines-grid">
        {visibleTimelines.map((timeline) => (
          <div
            key={timeline.id}
            className={`timeline-card ${selectedTimeline === timeline.id ? 'expanded' : ''}`}
          >
            <div
              className="timeline-card-header"
              onClick={() => setSelectedTimeline(
                selectedTimeline === timeline.id ? null : timeline.id
              )}
            >
              <div className={`timeline-icon bg-gradient-to-br ${timeline.color}`}>
                <span className="timeline-flag">{timeline.flag}</span>
              </div>
              <h3 className="timeline-name">{timeline.name}</h3>
              <ChevronRight 
                className={`expand-icon ${selectedTimeline === timeline.id ? 'rotated' : ''}`} 
                size={20} 
              />
            </div>

            {selectedTimeline === timeline.id && (
              <div className="timeline-content">
                <div className="timeline-line"></div>
                {timeline.periods.map((period, idx) => (
                  <div key={idx} className="timeline-event">
                    <div className="event-marker">
                      <div className="marker-dot"></div>
                      <div className="marker-line"></div>
                    </div>
                    <div className="event-content">
                      <div className="event-year">
                        <Calendar size={16} />
                        {period.year}
                      </div>
                      <h4 className="event-title">{period.event}</h4>
                      <p className="event-description">{period.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {!showMore && (
        <button 
          className="show-more-btn"
          onClick={() => setShowMore(true)}
        >
          <span>Show More Timelines</span>
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
};

export default TimelinePageNew;
