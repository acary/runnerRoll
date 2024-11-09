import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { db } from '../../firebase/config';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import QuickNotes from '../QuickNotes';

const QUILL_MODULES = {
  toolbar: [
    ['bold', 'italic'],
    ['clean'],
    ['emoji']
  ]
};

const QUILL_FORMATS = [
  'bold',
  'italic',
  'emoji'
];

const Notes = ({ eventId, isOwner }) => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();

  // Fetch existing notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const notesQuery = query(
          collection(db, 'notes'),
          where('eventId', '==', eventId),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(notesQuery);
        const notesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setNotes(notesList);
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      const noteData = {
        eventId,
        content: newNote.trim(),
        createdAt: new Date().toISOString(),
        authorName: user ? user.displayName : 'Anonymous',
        authorId: user ? user.uid : null,
        authorPhoto: user ? user.photoURL : null
      };

      await addDoc(collection(db, 'notes'), noteData);
      setNewNote('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  if (loading) return <div className="notes-loading">Loading notes...</div>;

  return (
    <div className="notes-container">
      <h3>Congratulate the Runner</h3>
      
      <QuickNotes onSelectMessage={(message) => setNewNote(message)} />

      <form onSubmit={handleSubmit} className="note-form">
        <ReactQuill
          value={newNote}
          onChange={setNewNote}
          modules={QUILL_MODULES}
          formats={QUILL_FORMATS}
          placeholder="Write a congratulatory note..."
          className="note-editor"
        />
        <div className="note-form-footer">
          <span className="character-count">
            {newNote.replace(/<[^>]*>/g, '').length}/280
          </span>
          <button 
            type="submit" 
            disabled={!newNote.trim()}
            className="note-submit-button"
          >
            <i className="fas fa-paper-plane"></i>
            Post Note
          </button>
        </div>
      </form>

      {showSuccess && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          Thank you for your congratulations!
        </div>
      )}

      {isOwner && notes.length > 0 && (
        <div className="notes-section">
          <h4>Congratulatory Messages</h4>
          <div className="notes-list">
            {notes.map(note => (
              <div key={note.id} className="note-item">
                <div className="note-header">
                  {note.authorPhoto ? (
                    <img 
                      src={note.authorPhoto} 
                      alt={note.authorName} 
                      className="author-photo"
                    />
                  ) : (
                    <div className="anonymous-avatar">
                      <i className="fas fa-user"></i>
                    </div>
                  )}
                  <span className="author-name">{note.authorName}</span>
                  <span className="note-date">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="note-content">
                  {note.content.replace(/<[^>]*>/g, '')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes; 