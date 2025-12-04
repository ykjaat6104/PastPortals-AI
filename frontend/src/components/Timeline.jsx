import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Users, BookOpen, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { apiService } from '../utils/api';
import { useDebounce } from '../hooks/useCustomHooks';

const Timeline = () => {
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState({
    era: 'all',
    category: 'all',
    region: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  const eventsPerPage = 10;

  // Predefined historical periods
  const historicalPeriods = [
    { name: 'Ancient History', range: '3000 BCE - 500 CE', query: 'Ancient civilizations history', color: '#8B5A3C' },
    { name: 'Medieval Period', range: '500 - 1500 CE', query: 'Medieval history', color: '#4A5568' },
    { name: 'Renaissance', range: '1400 - 1600 CE', query: 'Renaissance period history', color: '#D97706' },
    { name: 'Age of Exploration', range: '1500 - 1800 CE', query: 'Age of Exploration history', color: '#059669' },
    { name: 'Industrial Revolution', range: '1760 - 1840 CE', query: 'Industrial Revolution history', color: '#7C3AED' },
    { name: 'Modern Era', range: '1900 - Present', query: 'Modern world history', color: '#DC2626' }
  ];

  const [selectedPeriod, setSelectedPeriod] = useState(null);

  useEffect(() => {
    if (selectedPeriod) {
      fetchTimelineData(selectedPeriod.query);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    if (debouncedSearch) {
      fetchTimelineData(debouncedSearch);
    }
  }, [debouncedSearch]);

  const fetchTimelineData = async (query) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use askQuestion to get historical data
      const response = await apiService.askQuestion(query || 'Tell me about major historical events and their dates');

      // Create sample timeline events from response
      const sampleEvents = [
        {
          id: 1,
          title: 'Ancient Egypt Civilization',
          date: '3100 BCE',
          description: 'The unification of Upper and Lower Egypt marks the beginning of the Pharaonic period.',
          fullContent: response.answer || 'Ancient Egyptian civilization flourished along the Nile River.',
          category: 'Ancient History',
          region: 'Africa'
        },
        {
          id: 2,
          title: 'Roman Empire Founded',
          date: '27 BCE',
          description: 'Augustus becomes the first Roman Emperor, transforming the Republic into an Empire.',
          fullContent: 'The Roman Empire begins its reign over the Mediterranean world.',
          category: 'Ancient History',
          region: 'Europe'
        },
        {
          id: 3,
          title: 'Renaissance Period',
          date: '1400 CE',
          description: 'A cultural rebirth in Europe marking the transition from Middle Ages to modernity.',
          fullContent: 'The Renaissance brought revolutionary changes in art, science, and philosophy.',
          category: 'Medieval History',
          region: 'Europe'
        }
      ];
      
      setTimelineData(sampleEvents);
      setCurrentPage(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const extractTitle = (content) => {
    const firstLine = content.split('\n')[0];
    return firstLine.length > 100 ? firstLine.substring(0, 100) + '...' : firstLine;
  };

  const extractDate = (content) => {
    // Simple date extraction - look for patterns like "YYYY", "YYYY BCE", etc.
    const datePatterns = [
      /(\d{1,4})\s*(BCE|BC|CE|AD)/i,
      /(\d{1,4})/
    ];
    
    for (const pattern of datePatterns) {
      const match = content.match(pattern);
      if (match) return match[0];
    }
    return null;
  };

  const handlePeriodClick = (period) => {
    setSelectedPeriod(period);
    setSearchQuery('');
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const paginatedEvents = timelineData.slice(
    currentPage * eventsPerPage,
    (currentPage + 1) * eventsPerPage
  );

  const totalPages = Math.ceil(timelineData.length / eventsPerPage);

  return (
    <div className="timeline-page">
      <div className="timeline-container">
        {/* Header */}
        <motion.div 
          className="timeline-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Clock size={48} color="#6366F1" />
          <h1>Interactive Historical Timeline</h1>
          <p>Explore world history through an interactive chronological journey</p>
        </motion.div>

        {/* Period Selection */}
        <div className="periods-selection">
          <h3>Historical Periods</h3>
          <div className="periods-grid">
            {historicalPeriods.map((period, index) => (
              <motion.div
                key={index}
                className={`period-card ${selectedPeriod?.name === period.name ? 'active' : ''}`}
                style={{ borderLeftColor: period.color }}
                onClick={() => handlePeriodClick(period)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="period-color" style={{ backgroundColor: period.color }} />
                <div className="period-info">
                  <h4>{period.name}</h4>
                  <span className="period-range">{period.range}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="timeline-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search historical events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="timeline-search"
            />
          </div>

          <div className="timeline-filters">
            <Filter />
            <select 
              value={filters.category} 
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="war">Wars & Conflicts</option>
              <option value="culture">Culture & Arts</option>
              <option value="science">Science & Technology</option>
              <option value="politics">Politics</option>
            </select>

            <select 
              value={filters.region} 
              onChange={(e) => handleFilterChange('region', e.target.value)}
            >
              <option value="all">All Regions</option>
              <option value="europe">Europe</option>
              <option value="asia">Asia</option>
              <option value="africa">Africa</option>
              <option value="americas">Americas</option>
              <option value="oceania">Oceania</option>
            </select>
          </div>
        </div>

        {/* Timeline Events */}
        <div className="timeline-content">
          {loading ? (
            <div className="timeline-loading">
              <div className="spinner"></div>
              <p>Loading historical events...</p>
            </div>
          ) : error ? (
            <div className="timeline-error">
              <p>Error loading timeline: {error}</p>
            </div>
          ) : timelineData.length === 0 ? (
            <div className="timeline-empty">
              <BookOpen size={64} color="#CBD5E0" />
              <h3>Select a period to explore</h3>
              <p>Choose a historical period above or search for specific events</p>
            </div>
          ) : (
            <>
              <div className="timeline-line">
                <AnimatePresence mode="wait">
                  {paginatedEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      className={`timeline-event ${index % 2 === 0 ? 'left' : 'right'}`}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="timeline-marker">
                        <div className="marker-dot" />
                      </div>
                      
                      <div className="event-card">
                        <div className="event-date">{event.date}</div>
                        <h3>{event.title}</h3>
                        <p>{event.description}</p>
                        
                        <div className="event-meta">
                          <span className="meta-item">
                            <MapPin size={12} />
                            {event.region}
                          </span>
                          <span className="meta-item">
                            <BookOpen size={12} />
                            {event.category}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="timeline-pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className="pagination-btn"
                  >
                    <ChevronLeft />
                  </button>
                  
                  <span className="pagination-info">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="pagination-btn"
                  >
                    <ChevronRight />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Event Detail Modal */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              className="event-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
            >
              <motion.div
                className="event-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button className="close-modal" onClick={() => setSelectedEvent(null)}>
                  ×
                </button>
                
                <div className="modal-header">
                  <h2>{selectedEvent.title}</h2>
                  <div className="event-date-large">{selectedEvent.date}</div>
                </div>
                
                <div className="modal-body">
                  <div className="event-metadata">
                    <div className="metadata-row">
                      <MapPin />
                      <span><strong>Region:</strong> {selectedEvent.region}</span>
                    </div>
                    <div className="metadata-row">
                      <BookOpen />
                      <span><strong>Category:</strong> {selectedEvent.category}</span>
                    </div>
                  </div>
                  
                  <div className="event-content">
                    <p>{selectedEvent.fullContent}</p>
                  </div>
                  
                  {selectedEvent.source && (
                    <div className="event-source">
                      <small>Source: <a href={selectedEvent.source} target="_blank" rel="noopener noreferrer">
                        {selectedEvent.source}
                      </a></small>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add styles */}
      <style jsx>{`
        .timeline-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem 0;
        }

        .timeline-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .timeline-header {
          text-align: center;
          color: white;
          margin-bottom: 3rem;
        }

        .timeline-header h1 {
          font-size: 2.5rem;
          margin: 1rem 0;
        }

        .timeline-header p {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .periods-selection {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .periods-selection h3 {
          margin-bottom: 1.5rem;
          color: #2D3748;
        }

        .periods-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .period-card {
          background: #F7FAFC;
          border-left: 4px solid;
          border-radius: 0.5rem;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .period-card:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .period-card.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .period-color {
          width: 8px;
          height: 60px;
          border-radius: 4px;
        }

        .period-info h4 {
          margin: 0 0 0.25rem 0;
          font-size: 1.1rem;
        }

        .period-range {
          font-size: 0.875rem;
          opacity: 0.8;
        }

        .timeline-controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .search-box {
          flex: 1;
        }

        .timeline-search {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid white;
          border-radius: 0.5rem;
          font-size: 1rem;
        }

        .timeline-filters {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          background: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
        }

        .timeline-filters select {
          padding: 0.5rem;
          border: 1px solid #E2E8F0;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }

        .timeline-content {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          min-height: 500px;
        }

        .timeline-line {
          position: relative;
          padding: 2rem 0;
        }

        .timeline-line::before {
          content: '';
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 100%;
          background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
          border-radius: 2px;
        }

        .timeline-event {
          display: flex;
          margin-bottom: 3rem;
          position: relative;
        }

        .timeline-event.left {
          justify-content: flex-end;
          padding-right: calc(50% + 2rem);
        }

        .timeline-event.right {
          justify-content: flex-start;
          padding-left: calc(50% + 2rem);
        }

        .timeline-marker {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }

        .marker-dot {
          width: 20px;
          height: 20px;
          background: white;
          border: 4px solid #667eea;
          border-radius: 50%;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
        }

        .event-card {
          background: #F7FAFC;
          border-radius: 0.75rem;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s;
          max-width: 500px;
        }

        .event-card:hover {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
          transform: translateY(-4px);
        }

        .event-date {
          color: #667eea;
          font-weight: 700;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .event-card h3 {
          margin: 0 0 0.75rem 0;
          color: #2D3748;
        }

        .event-card p {
          color: #4A5568;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .event-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          color: #718096;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .timeline-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2rem;
          margin-top: 2rem;
        }

        .pagination-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: background 0.2s;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #764ba2;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-info {
          font-weight: 500;
          color: #4A5568;
        }

        .timeline-loading,
        .timeline-error,
        .timeline-empty {
          text-align: center;
          padding: 4rem 2rem;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #E2E8F0;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .event-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .event-modal {
          background: white;
          border-radius: 1rem;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .close-modal {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          border: none;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          font-size: 1.5rem;
          cursor: pointer;
          z-index: 10;
        }

        .modal-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          border-radius: 1rem 1rem 0 0;
        }

        .modal-header h2 {
          margin: 0 0 0.5rem 0;
        }

        .event-date-large {
          font-size: 1.25rem;
          font-weight: 600;
          opacity: 0.9;
        }

        .modal-body {
          padding: 2rem;
        }

        .event-metadata {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #E2E8F0;
        }

        .metadata-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #4A5568;
        }

        .event-content {
          line-height: 1.8;
          color: #2D3748;
        }

        .event-source {
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #E2E8F0;
        }

        .event-source a {
          color: #667eea;
        }

        @media (max-width: 768px) {
          .timeline-line::before {
            left: 2rem;
          }

          .timeline-event.left,
          .timeline-event.right {
            padding-left: 4rem;
            padding-right: 0;
            justify-content: flex-start;
          }

          .timeline-marker {
            left: 2rem;
          }

          .timeline-controls {
            flex-direction: column;
          }

          .periods-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Timeline;
