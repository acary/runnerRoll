import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { db, auth, googleProvider } from '../../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signInWithPopup } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import Notes from '../Notes';
import './EventPreview.css';

const EventPreview = () => {
  const { eventId } = useParams();
  const location = useLocation();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const { user } = useAuth();

  // Use state data if available, otherwise fetch from Firestore
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        if (location.state) {
          setEventData(location.state);
          setLoading(false);
          return;
        }

        const eventDoc = await getDoc(doc(db, 'events', eventId));
        
        if (!eventDoc.exists()) {
          setError('Event not found');
          return;
        }

        const eventDetails = eventDoc.data();
        
        if (!eventDetails.photoId) {
          setError('Event photo not found');
          return;
        }

        const photoDoc = await getDoc(doc(db, 'photos', eventDetails.photoId));
        
        if (!photoDoc.exists()) {
          setError('Photo details not found');
          return;
        }

        setEventData({
          eventId,
          runnerName: eventDetails.runnerName,
          eventData: {
            eventName: eventDetails.eventName,
            eventDate: eventDetails.eventDate,
            eventTime: eventDetails.eventTime,
            location: eventDetails.location,
            finishTime: eventDetails.finishTime
          },
          imageUrl: photoDoc.data().imageUrl,
          photoId: photoDoc.id,
          userId: eventDetails.userId
        });
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId, location.state]);

  const handleGoogleSignIn = async () => {
    try {
      setSaveStatus('signing-in');
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Error signing in:', err);
      setSaveStatus('error');
    }
  };

  const handleSaveToAccount = async () => {
    if (!user || !eventData) return;

    try {
      setSaveStatus('saving');
      await updateDoc(doc(db, 'events', eventId), {
        userId: user.uid
      });
      setSaveStatus('saved');
      setEventData(prev => ({
        ...prev,
        userId: user.uid
      }));
    } catch (err) {
      console.error('Error saving event:', err);
      setSaveStatus('error');
    }
  };

  const handleShare = async () => {
    if (!eventData) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${eventData.runnerName}'s ${eventData.eventData.eventName} Achievement`,
          text: `Check out ${eventData.runnerName}'s achievement at ${eventData.eventData.eventName}!`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleDownload = () => {
    if (!eventData) return;

    const link = document.createElement('a');
    link.href = eventData.imageUrl;
    link.download = `${eventData.runnerName}-${eventData.eventData.eventName}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="loading">Loading event details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!eventData) return <div className="error">No event data available</div>;

  const { runnerName, eventData: details, imageUrl, userId } = eventData;
  const isEventSaved = userId === user?.uid;

  return (
    <div className="event-preview-container">
      <header className="event-preview-header">
        <h1>{details?.eventName || 'Event'}</h1>
        <p className="runner-name">Featuring {runnerName}</p>
      </header>

      <div className="event-preview-content">
        <div className="photo-container">
          <img 
            src={imageUrl} 
            alt={`${runnerName} at ${details?.eventName || 'the event'}`}
            className="event-photo"
          />
        </div>

        <div className="event-info">
          <div className="info-section">
            <h2>Event Details</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Date</label>
                <span>{details?.eventDate ? new Date(details.eventDate).toLocaleDateString() : 'Not specified'}</span>
              </div>
              <div className="info-item">
                <label>Start Time</label>
                <span>{details?.eventTime || 'Not specified'}</span>
              </div>
              <div className="info-item">
                <label>Location</label>
                <span>{details?.location || 'Not specified'}</span>
              </div>
              <div className="info-item">
                <label>Finish Time</label>
                <span>{details?.finishTime || 'Not specified'}</span>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            {/* Sign In Button - Show when user is not logged in */}
            {!user && (
              <button 
                className="save-button"
                onClick={handleGoogleSignIn}
                disabled={saveStatus === 'signing-in'}
              >
                <i className="fas fa-sign-in-alt"></i>
                Sign in to Save
              </button>
            )}

            {/* Save Button - Show when user is logged in, event is not saved, and not owned by another user */}
            {user && !isEventSaved && !eventData.userId && (
              <button 
                className="save-button"
                onClick={handleSaveToAccount}
                disabled={saveStatus === 'saving'}
              >
                <i className="fas fa-save"></i>
                {saveStatus === 'saving' ? 'Saving...' : 'Save to My Events'}
              </button>
            )}

            {/* Download Button - Show when user owns this event */}
            {isEventSaved && (
              <button 
                className="save-button download-button"
                onClick={handleDownload}
              >
                <i className="fas fa-download"></i>
                Download Photo
              </button>
            )}

            {/* Share Button - Always visible */}
            <button 
              className="share-button" 
              onClick={handleShare}
            >
              <i className="fas fa-share-alt"></i>
              Share Achievement
            </button>
          </div>

          {saveStatus === 'saved' && (
            <div className="success-message">
              Event saved to your account!
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="error-message">
              Failed to save event. Please try again.
            </div>
          )}
        </div>
      </div>

      <div className="notes-section">
        <Notes eventId={eventId} isOwner={user?.uid === eventData.userId} />
      </div>
    </div>
  );
};

export default EventPreview;