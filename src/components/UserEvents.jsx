import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import './UserEvents.css';

const UserEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUserEvents = async () => {
    try {
      const eventsQuery = query(
        collection(db, 'events'),
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(eventsQuery);
      const eventsData = [];
      
      for (const doc of querySnapshot.docs) {
        const event = doc.data();
        const photoDoc = await getDocs(
          query(collection(db, 'photos'), 
          where('eventId', '==', doc.id))
        );
        
        eventsData.push({
          id: doc.id,
          ...event,
          photoUrl: photoDoc.docs[0]?.data()?.imageUrl
        });
      }
      
      setEvents(eventsData);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load your events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserEvents();
    }
  }, [user]);

  const handleDelete = async (eventId) => {
    setIsDeleting(true);
    try {
      // Delete the event document
      await deleteDoc(doc(db, 'events', eventId));
      
      // Delete associated photos
      const photoQuery = query(
        collection(db, 'photos'),
        where('eventId', '==', eventId)
      );
      const photoSnapshot = await getDocs(photoQuery);
      
      for (const doc of photoSnapshot.docs) {
        await deleteDoc(doc.ref);
      }

      // Update local state
      setEvents(events.filter(event => event.id !== eventId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div className="loading">Loading your events...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="user-events-container">
      <header className="user-events-header">
        <h1>My Events</h1>
        <button 
          className="new-event-button"
          onClick={() => navigate('/')}
        >
          Create New Event
        </button>
      </header>

      <div className="events-grid">
        {events.length === 0 ? (
          <div className="no-events">
            <p>You haven't created any events yet.</p>
            <button 
              className="create-first-button"
              onClick={() => navigate('/')}
            >
              Create Your First Event
            </button>
          </div>
        ) : (
          events.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-image">
                <img src={event.photoUrl} alt={`${event.runnerName}'s event`} />
                <button 
                  className="delete-button"
                  onClick={() => setDeleteConfirm(event.id)}
                  aria-label="Delete event"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
              <div className="event-info">
                <h3>{event.eventName}</h3>
                <p>{event.runnerName}</p>
                <p className="event-date">
                  {new Date(event.eventDate).toLocaleDateString()}
                </p>
              </div>
              <button 
                className="view-event-button"
                onClick={() => navigate(`/event/${event.id}`)}
              >
                View Event
              </button>
            </div>
          ))
        )}
      </div>

      {deleteConfirm && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            <h2>Delete Event</h2>
            <p>Are you sure you want to delete this event? This action cannot be undone.</p>
            <div className="delete-modal-buttons">
              <button 
                className="cancel-button"
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-button"
                onClick={() => handleDelete(deleteConfirm)}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserEvents;