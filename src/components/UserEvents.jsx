import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import './UserEvents.css';

const UserEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    if (user) {
      fetchUserEvents();
    }
  }, [user]);

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
    </div>
  );
};

export default UserEvents; 