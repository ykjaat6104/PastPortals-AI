import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Home from './components/Home';
import HistoryExplorer from './components/HistoryExplorer';
import About from './components/About';
import { APIProvider } from './contexts/APIContext';
import { NotificationProvider } from './contexts/NotificationContext';
import './styles/globals.css';
import './styles/components.css';

function App() {
  return (
    <APIProvider>
      <NotificationProvider>
        <Router>
          <div className="App">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<HistoryExplorer />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </main>
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