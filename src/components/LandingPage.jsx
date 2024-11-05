import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [runnerName, setRunnerName] = useState('');
  const [showSignup, setShowSignup] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRunnerSubmit = (e) => {
    e.preventDefault();
    if (runnerName.trim()) {
      navigate('/event-details', { state: { runnerName: runnerName } });
    }
  };

  return (
    <div className="landing-container">
      <header className="hero">
        <h1>Runner Roll</h1>
        <p className="tagline">Celebrate your runner's achievement with a personalized photo gift</p>
      </header>

      <section className="features">
        <div className="feature-card">
          <i className="fas fa-camera"></i>
          <h3>Create Beautiful Memories</h3>
          <p>Design custom photo gifts for your 5K finisher</p>
        </div>
        <div className="feature-card">
          <i className="fas fa-gift"></i>
          <h3>Personalized Gifts</h3>
          <p>Add custom messages and decorations</p>
        </div>
        <div className="feature-card">
          <i className="fas fa-share"></i>
          <h3>Easy Sharing</h3>
          <p>Share directly to social media or download</p>
        </div>
      </section>

      <section className="runner-section">
        <div className="runner-form">
          <h2>Who's Your Champion?</h2>
          <form onSubmit={handleRunnerSubmit}>
            <div className="form-group">
              <input
                type="text"
                value={runnerName}
                onChange={(e) => setRunnerName(e.target.value)}
                placeholder="Enter Runner's Name"
                required
              />
            </div>
            <button type="submit" className="start-button">
              Start
            </button>
          </form>
        </div>
      </section>

      {showSignup && (
        <section className="signup-section">
          <div className="signup-form">
            <h2>Sign Up to Create Gift for {runnerName}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="signup-button">
                Get Started
              </button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
};

export default LandingPage; 