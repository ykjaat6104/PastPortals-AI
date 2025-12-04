import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Menu, 
  X, 
  Settings, 
  Home, 
  Compass, 
  Info,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff,
  Search,
  Museum
} from 'lucide-react';
import { FaClock, FaMicrophone } from 'react-icons/fa';
import { useAPI } from '../contexts/APIContext';
import ConfigModal from './ConfigModal';

const Header = () => {
  const location = useLocation();
  const { isConfigured, serverStatus } = useAPI();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/explore', label: 'Explore', icon: Compass },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/museums', label: 'Museums', icon: Museum },
    { path: '/timeline', label: 'Timeline', icon: FaClock },
    { path: '/voice', label: 'Voice Guide', icon: FaMicrophone },
    { path: '/about', label: 'About', icon: Info },
  ];

  const getStatusIcon = () => {
    if (!serverStatus) return <WifiOff className="w-4 h-4" />;
    
    if (serverStatus.status === 'online') {
      return isConfigured ? 
        <CheckCircle className="w-4 h-4 text-success-500" /> : 
        <Wifi className="w-4 h-4 text-warning-500" />;
    }
    
    return <XCircle className="w-4 h-4 text-error-500" />;
  };

  const getStatusText = () => {
    if (!serverStatus) return 'Connecting...';
    
    if (serverStatus.status === 'online') {
      return isConfigured ? 'AI Ready' : 'Setup Required';
    }
    
    return 'Server Offline';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="header"
      >
        <div className="container">
          <div className="header-content">
            {/* Logo */}
            <Link to="/" className="logo">
              <motion.div
                whileHover={{ rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Building2 className="logo-icon" />
              </motion.div>
              <div className="logo-text">
                <h1>AI Museum Guide</h1>
                <span className="tagline">Explore World History</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="nav-desktop">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`nav-link ${location.pathname === path ? 'active' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </nav>

            {/* Status & Actions */}
            <div className="header-actions">
              {/* Status Indicator */}
              <motion.div
                className="status-indicator"
                whileHover={{ scale: 1.05 }}
              >
                {getStatusIcon()}
                <span className="status-text">{getStatusText()}</span>
              </motion.div>

              {/* Config Button */}
              <motion.button
                className="btn btn-primary"
                onClick={() => setIsConfigModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="w-4 h-4" />
                <span className="mobile-hidden">Configure</span>
              </motion.button>

              {/* Mobile Menu Toggle */}
              <button
                className="mobile-menu-toggle"
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              className="nav-mobile"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="nav-mobile-content">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`nav-link-mobile ${
                      location.pathname === path ? 'active' : ''
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </Link>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Configuration Modal */}
      <ConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />
    </>
  );
};

export default Header;