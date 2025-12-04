import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Loader, Globe, Calendar, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce, useInfiniteScroll } from '../hooks/useCustomHooks';
import { apiService } from '../utils/api';
import { useNotification } from '../contexts/NotificationContext';
import ReactMarkdown from 'react-markdown';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    era: 'all',
    region: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const debouncedSearch = useDebounce(searchQuery, 500);
  const { showError, showSuccess } = useNotification();

  const loadMoreRef = useInfiniteScroll(
    () => loadMore(),
    hasMore,
    loading
  );

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'ancient_civilizations', label: 'Ancient Civilizations' },
    { value: 'medieval_period', label: 'Medieval Period' },
    { value: 'renaissance', label: 'Renaissance & Enlightenment' },
    { value: 'modern_history', label: 'Modern History' },
    { value: 'world_leaders', label: 'World Leaders' },
    { value: 'cultural_heritage', label: 'Cultural Heritage' },
    { value: 'wars_conflicts', label: 'Wars & Conflicts' }
  ];

  const eras = [
    { value: 'all', label: 'All Eras' },
    { value: 'ancient', label: 'Ancient (Before 500 AD)' },
    { value: 'medieval', label: 'Medieval (500-1500 AD)' },
    { value: 'early_modern', label: 'Early Modern (1500-1800)' },
    { value: 'modern', label: 'Modern (1800-Present)' }
  ];

  const regions = [
    { value: 'all', label: 'All Regions' },
    { value: 'asia', label: 'Asia' },
    { value: 'europe', label: 'Europe' },
    { value: 'africa', label: 'Africa' },
    { value: 'americas', label: 'Americas' },
    { value: 'oceania', label: 'Oceania' },
    { value: 'middle_east', label: 'Middle East' }
  ];

  const performSearch = async (query, pageNum = 1, reset = false) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    
    try {
      const response = await apiService.askQuestion(query);
      
      if (reset) {
        setResults([response]);
        setPage(1);
      } else {
        setResults(prev => [...prev, response]);
      }
      
      // Simulate pagination (in real app, backend would handle this)
      setHasMore(false);
      
    } catch (error) {
      showError(error.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedSearch) {
      performSearch(debouncedSearch, 1, true);
    } else {
      setResults([]);
    }
  }, [debouncedSearch]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      performSearch(searchQuery, nextPage, false);
    }
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      era: 'all',
      region: 'all'
    });
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== 'all').length;

  return (
    <div className="search-page">
      <div className="search-container">
        {/* Search Header */}
        <motion.div
          className="search-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>🔍 Explore World History</h1>
          <p>Search through thousands of historical topics, events, and figures</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="search-bar-wrapper"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="search-input-group">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search for historical events, figures, civilizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <button
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            Filters
            {activeFilterCount > 0 && (
              <span className="filter-badge">{activeFilterCount}</span>
            )}
          </button>
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="filters-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="filters-grid">
                <div className="filter-group">
                  <label>
                    <Globe size={16} />
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>
                    <Calendar size={16} />
                    Era
                  </label>
                  <select
                    value={filters.era}
                    onChange={(e) => setFilters(prev => ({ ...prev, era: e.target.value }))}
                  >
                    {eras.map(era => (
                      <option key={era.value} value={era.value}>
                        {era.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>
                    <MapPin size={16} />
                    Region
                  </label>
                  <select
                    value={filters.region}
                    onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
                  >
                    {regions.map(region => (
                      <option key={region.value} value={region.value}>
                        {region.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button className="clear-filters" onClick={clearFilters}>
                  <X size={14} />
                  Clear all filters
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="search-results">
          {loading && results.length === 0 ? (
            <div className="loading-state">
              <Loader className="spinner" size={32} />
              <p>Searching historical records...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="results-header">
                <p>{results.length} result{results.length !== 1 ? 's' : ''} found</p>
              </div>

              <div className="results-list">
                {results.map((result, index) => (
                  <motion.div
                    key={index}
                    className="result-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="result-content">
                      <ReactMarkdown>{result.answer}</ReactMarkdown>
                    </div>

                    {result.wikipedia_info && (
                      <div className="result-meta">
                        <a
                          href={result.wikipedia_info.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="source-link"
                        >
                          📚 View on Wikipedia
                        </a>
                      </div>
                    )}

                    <div className="result-footer">
                      <span className="source-badge">{result.source}</span>
                      <span className="timestamp">{new Date(result.timestamp).toLocaleString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Infinite Scroll Trigger */}
              <div ref={loadMoreRef} className="load-more-trigger">
                {loading && (
                  <div className="loading-more">
                    <Loader className="spinner" size={24} />
                    <p>Loading more results...</p>
                  </div>
                )}
              </div>
            </>
          ) : searchQuery && !loading ? (
            <div className="no-results">
              <Search size={48} opacity={0.3} />
              <h3>No results found</h3>
              <p>Try different keywords or clear some filters</p>
            </div>
          ) : (
            <div className="empty-state">
              <Search size={64} opacity={0.2} />
              <h3>Start your historical journey</h3>
              <p>Enter a search query to explore world history</p>
              <div className="suggestions">
                <p>Popular searches:</p>
                <div className="suggestion-chips">
                  {['Ancient Egypt', 'Roman Empire', 'World War II', 'Renaissance'].map(term => (
                    <button
                      key={term}
                      className="suggestion-chip"
                      onClick={() => setSearchQuery(term)}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
