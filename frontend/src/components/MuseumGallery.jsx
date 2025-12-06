import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, Image, ExternalLink, Loader, MapPin, Calendar } from 'lucide-react';
import { apiService } from '../utils/api';
import { useNotification } from '../contexts/NotificationContext';
import { useDebounce } from '../hooks/useCustomHooks';

const MuseumGallery = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState(null);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  
  const debouncedSearch = useDebounce(searchQuery, 600);
  const { showError } = useNotification();

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    if (debouncedSearch) {
      searchArtifacts(debouncedSearch);
    } else {
      setArtifacts([]);
    }
  }, [debouncedSearch]);

  const loadCollections = async () => {
    try {
      const data = await apiService.getMuseumCollections();
      setCollections(data.collections);
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  };

  const searchArtifacts = async (query) => {
    setLoading(true);
    try {
      const response = await apiService.searchMuseums(query, 20);
      setArtifacts(response.results.smithsonian || []);
    } catch (error) {
      showError(error.message || 'Failed to search museums');
      setArtifacts([]);
    } finally {
      setLoading(false);
    }
  };

  const popularSearches = [
    'Ancient Egyptian pottery',
    'Greek sculptures',
    'Medieval armor',
    'Renaissance paintings',
    'Ancient coins',
    'Historical manuscripts'
  ];

  return (
    <div className="museum-gallery">
      <div className="gallery-container">
        {/* Header */}
        <motion.div
          className="gallery-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="header-content">
            <Building2 size={48} />
            <div>
              <h1>Museum Collection Gallery</h1>
              <p>Explore artifacts from world-class museums</p>
            </div>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="gallery-search"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="search-input-group">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search museum collections (e.g., 'Egyptian artifacts', 'Roman coins')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </motion.div>

        {/* Popular Searches */}
        {!searchQuery && (
          <motion.div
            className="popular-searches"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p>Popular searches:</p>
            <div className="search-chips">
              {popularSearches.map((term, idx) => (
                <button
                  key={idx}
                  className="search-chip"
                  onClick={() => setSearchQuery(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Results */}
        <div className="gallery-content">
          {loading ? (
            <div className="loading-state">
              <Loader className="spinner" size={40} />
              <p>Searching museum collections...</p>
            </div>
          ) : artifacts.length > 0 ? (
            <>
              <div className="results-count">
                <p>{artifacts.length} artifact{artifacts.length !== 1 ? 's' : ''} found</p>
              </div>

              <div className="artifacts-grid">
                {artifacts.map((artifact, index) => (
                  <motion.div
                    key={artifact.id || index}
                    className="artifact-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedArtifact(artifact)}
                  >
                    {artifact.images && artifact.images.length > 0 ? (
                      <div className="artifact-image">
                        <img
                          src={artifact.images[0].thumbnail || artifact.images[0].url}
                          alt={artifact.title}
                          loading="lazy"
                        />
                        <div className="image-overlay">
                          <Image size={24} />
                        </div>
                      </div>
                    ) : (
                      <div className="artifact-placeholder">
                        <Building2 size={48} opacity={0.3} />
                      </div>
                    )}

                    <div className="artifact-info">
                      <h3>{artifact.title || 'Untitled Artifact'}</h3>
                      
                      {artifact.date && (
                        <div className="artifact-meta">
                          <Calendar size={14} />
                          <span>{Array.isArray(artifact.date) ? artifact.date[0] : artifact.date}</span>
                        </div>
                      )}

                      {artifact.culture && (
                        <div className="artifact-meta">
                          <MapPin size={14} />
                          <span>{Array.isArray(artifact.culture) ? artifact.culture[0] : artifact.culture}</span>
                        </div>
                      )}

                      <div className="artifact-footer">
                        <span className="source-badge">{artifact.source}</span>
                        {artifact.url && (
                          <a
                            href={artifact.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view-link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : searchQuery && !loading ? (
            <div className="no-results">
              <Building2 size={64} opacity={0.2} />
              <h3>No artifacts found</h3>
              <p>Try different search terms or explore our popular searches above</p>
            </div>
          ) : (
            <div className="collections-showcase">
              <h2>Available Museum Collections</h2>
              {collections && (
                <div className="collections-grid">
                  {Object.entries(collections).map(([key, collection]) => (
                    <motion.div
                      key={key}
                      className="collection-card"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Building2 size={32} />
                      <h3>{collection.name}</h3>
                      <p>{collection.description}</p>
                      <div className="collection-stats">
                        <span className="stat">
                          {collection.total_items} items
                        </span>
                        {collection.open_access && (
                          <span className="badge">Open Access</span>
                        )}
                      </div>
                      {collection.collections && (
                        <div className="sub-collections">
                          {collection.collections.slice(0, 3).map((col, idx) => (
                            <span key={idx} className="sub-collection">{col}</span>
                          ))}
                          {collection.collections.length > 3 && (
                            <span className="more">+{collection.collections.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Artifact Detail Modal */}
        {selectedArtifact && (
          <motion.div
            className="artifact-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSelectedArtifact(null)}
          >
            <motion.div
              className="artifact-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="close-modal"
                onClick={() => setSelectedArtifact(null)}
              >
                ×
              </button>

              {selectedArtifact.images && selectedArtifact.images.length > 0 && (
                <div className="modal-image">
                  <img
                    src={selectedArtifact.images[0].url || selectedArtifact.images[0].thumbnail}
                    alt={selectedArtifact.title}
                  />
                </div>
              )}

              <div className="modal-content">
                <h2>{selectedArtifact.title}</h2>
                
                {selectedArtifact.description && (
                  <p className="description">{selectedArtifact.description}</p>
                )}

                <div className="modal-metadata">
                  {selectedArtifact.date && (
                    <div className="metadata-item">
                      <Calendar size={16} />
                      <div>
                        <strong>Date:</strong>
                        <span>{Array.isArray(selectedArtifact.date) ? selectedArtifact.date[0] : selectedArtifact.date}</span>
                      </div>
                    </div>
                  )}

                  {selectedArtifact.culture && (
                    <div className="metadata-item">
                      <MapPin size={16} />
                      <div>
                        <strong>Culture:</strong>
                        <span>{Array.isArray(selectedArtifact.culture) ? selectedArtifact.culture[0] : selectedArtifact.culture}</span>
                      </div>
                    </div>
                  )}

                  {selectedArtifact.type && (
                    <div className="metadata-item">
                      <Building2 size={16} />
                      <div>
                        <strong>Type:</strong>
                        <span>{selectedArtifact.type}</span>
                      </div>
                    </div>
                  )}
                </div>

                {selectedArtifact.url && (
                  <a
                    href={selectedArtifact.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-full-btn"
                  >
                    <ExternalLink size={18} />
                    View Full Details at {selectedArtifact.source}
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MuseumGallery;
