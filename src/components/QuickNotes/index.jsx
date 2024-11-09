import React from 'react';
import './QuickNotes.css';

const QUICK_MESSAGES = [
  "🎉 Congratulations on your achievement!",
  "💪 Incredible performance! Way to go!",
  "🏃‍♂️ Amazing run! You crushed it!",
  "⭐ Outstanding effort! Well done!",
  "🌟 Fantastic job! Keep inspiring!"
];

const QuickNotes = ({ onSelectMessage }) => {
  return (
    <div className="quick-notes">
      <h4 className="quick-notes-title">Quick Congratulate</h4>
      <div className="quick-notes-grid">
        {QUICK_MESSAGES.map((message, index) => (
          <button
            key={index}
            onClick={() => onSelectMessage(message)}
            className="quick-note-button"
          >
            {message}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickNotes; 