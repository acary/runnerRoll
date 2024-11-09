import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { db } from '../../firebase/config';
import { collection, addDoc, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import QuickNotes from '../QuickNotes';
import { motion } from 'framer-motion';
import './Notes.css';
import { formatDistanceToNow } from 'date-fns';

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

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteDoc(doc(db, 'notes', noteId));
        setNotes(notes.filter(note => note.id !== noteId));
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  if (loading) return <div className="notes-loading">Loading notes...</div>;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

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
          <motion.div 
            className="notes-list"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {notes.map(note => (
              <motion.div
                key={note.id}
                className="note-item"
                variants={item}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
              >
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
                    {formatTimeAgo(note.createdAt)}
                  </span>
                  {isOwner && (
                    <button 
                      className="delete-note-button"
                      onClick={() => handleDeleteNote(note.id)}
                      aria-label="Delete note"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  )}
                </div>
                <p className="note-content">
                  {note.content.replace(/<[^>]*>/g, '')}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Notes; 