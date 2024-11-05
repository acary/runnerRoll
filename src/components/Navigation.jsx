import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/config';
import './Navigation.css';

const Navigation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-content">
        <Link to="/" className="nav-logo">
          Runner Roll
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/my-events" className="nav-link">
                <i className="fas fa-trophy"></i>
                My Events
              </Link>
              <button onClick={handleSignOut} className="sign-out-button">
                <i className="fas fa-sign-out-alt"></i>
                Sign Out
              </button>
              <div className="user-profile">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="profile-photo" />
                ) : (
                  <i className="fas fa-user-circle"></i>
                )}
              </div>
            </>
          ) : (
            <Link to="/" className="nav-link">
              <i className="fas fa-home"></i>
              Home
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 