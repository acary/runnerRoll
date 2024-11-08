import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import EventDetails from './components/EventDetails';
import PhotoUpload from './components/PhotoUpload';
import EventPreview from './components/EventPreview';
import UserEvents from './components/UserEvents';
import AccountSettings from './components/AccountSettings';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <AuthProvider>
        <div className="App">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/event-details" element={<EventDetails />} />
              <Route path="/photo-upload" element={<PhotoUpload />} />
              <Route path="/event/:eventId/*" element={<EventPreview />} />
              <Route path="/my-events" element={<UserEvents />} />
              <Route path="/account" element={<AccountSettings />} />
            </Routes>
          </main>
          <Footer />
        </div>
    </AuthProvider>
  );
}

export default App; 