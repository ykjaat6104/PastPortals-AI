import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import ExplorePage from './components/ExplorePage';
import SearchPageNew from './components/SearchPageNew';
import TimelinePageNew from './components/TimelinePageNew';
import MuseumsPageNew from './components/MuseumsPageNew';
import { APIProvider } from './contexts/APIContext';
import { NotificationProvider } from './contexts/NotificationContext';
import './styles/globals.css';
import './styles/components.css';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <APIProvider>
      <NotificationProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="App">
            <Sidebar onSettingsClick={() => setIsSettingsOpen(true)} />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<ExplorePage />} />
                <Route path="/search" element={<SearchPageNew />} />
                <Route path="/timeline" element={<TimelinePageNew />} />
                <Route path="/museums" element={<MuseumsPageNew />} />
              </Routes>
            </main>
            <SettingsModal 
              isOpen={isSettingsOpen} 
              onClose={() => setIsSettingsOpen(false)} 
            />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--neutral-800)',
                  color: 'var(--neutral-0)',
                  borderRadius: 'var(--radius-lg)',
                },
              }}
            />
          </div>
        </Router>
      </NotificationProvider>
    </APIProvider>
  );
}

export default App;