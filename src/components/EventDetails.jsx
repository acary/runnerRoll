import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import './EventDetails.css';
import { useAuth } from '../context/AuthContext';

const EventDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const runnerName = location.state?.runnerName || '';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const [eventData, setEventData] = useState({
    eventName: '',
    eventDate: '',
    eventTime: '',
    location: '',
    finishTime: ''
  });

  const handleChange = (e) => {
    setEventData({
      ...eventData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Create event document with optional userId
      const eventDoc = {
        runnerName,
        ...eventData,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      // Only add userId if user is authenticated
      if (user) {
        eventDoc.userId = user.uid;
      }

      const docRef = await addDoc(collection(db, 'events'), eventDoc);

      console.log('Document written with ID: ', docRef.id);
      navigate('/photo-upload', { 
        state: { 
          eventId: docRef.id,
          runnerName,
          eventData 
        } 
      });
    } catch (err) {
      console.error('Error adding document: ', err);
      setError('Failed to save event details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReview = () => {
    setShowReview(true);
  };

  const [showReview, setShowReview] = useState(false);

  return (
    <div className="event-details-container">
      <header className="event-header">
        <h1>Event Details for {runnerName}</h1>
        <p>Tell us about the race achievement</p>
        {!user && (
          <p className="auth-note">
            Note: Sign in to save this event to your account
          </p>
        )}
      </header>

      <div className="event-form-container">
        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="eventName">Event Name</label>
            <input
              type="text"
              id="eventName"
              name="eventName"
              value={eventData.eventName}
              onChange={handleChange}
              placeholder="e.g., City Spring 5K"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="eventDate">Event Date</label>
            <input
              type="date"
              id="eventDate"
              name="eventDate"
              value={eventData.eventDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="eventTime">Start Time</label>
            <input
              type="time"
              id="eventTime"
              name="eventTime"
              value={eventData.eventTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={eventData.location}
              onChange={handleChange}
              placeholder="e.g., Central Park, New York"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="finishTime">Finish Time</label>
            <input
              type="text"
              id="finishTime"
              name="finishTime"
              value={eventData.finishTime}
              onChange={handleChange}
              placeholder="e.g., 25:30"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="button-group">
            <button 
              type="button" 
              className="review-button" 
              onClick={handleReview}
              disabled={isSubmitting}
            >
              Review Information
            </button>
            <button 
              type="submit" 
              className="next-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>

      {showReview && (
        <div className="review-modal">
          <div className="review-content">
            <h2>Review Information</h2>
            <div className="review-info">
              <h3>Runner Information</h3>
              <p><strong>Runner Name:</strong> {runnerName}</p>
              
              <h3>Event Information</h3>
              <p><strong>Event Name:</strong> {eventData.eventName}</p>
              <p><strong>Date:</strong> {eventData.eventDate}</p>
              <p><strong>Start Time:</strong> {eventData.eventTime}</p>
              <p><strong>Location:</strong> {eventData.location}</p>
              <p><strong>Finish Time:</strong> {eventData.finishTime}</p>
            </div>
            <button onClick={() => setShowReview(false)} className="close-button">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;