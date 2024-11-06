import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth, googleProvider } from '../../firebase/config';
import { signInWithPopup } from 'firebase/auth';
import './Navigation.css';

const Navigation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await signInWithPopup(auth, googleProvider);
      navigate('/my-events');
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <nav ref={navRef}>
      <div className="nav-content">
        <Link to="/" className="nav-logo">
          Runner Roll
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/my-events" className="nav-link">
                <i className="fas fa-trophy"></i>
                <span>My Events</span>
              </Link>
              <div className="profile-dropdown">
                <button 
                  onClick={() => setIsOpen(!isOpen)} 
                  className="profile-button"
                  aria-label="Profile menu"
                >
                  <div className="profile-image-container">
                    {user?.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt="Profile" 
                        className="profile-photo" 
                      />
                    ) : (
                      <i className="fas fa-user-circle profile-icon"></i>
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <p className="user-name">{user.displayName}</p>
                      <p className="user-email">{user.email}</p>
                    </div>
                    <Link to="/account" className="dropdown-item" onClick={handleNavClick}>
                      <i className="fas fa-cog"></i>
                      Account Settings
                    </Link>
                    <button onClick={handleSignOut} className="dropdown-item">
                      <i className="fas fa-sign-out-alt"></i>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link">
                <i className="fas fa-home"></i>
                <span>Home</span>
              </Link>
              <button 
                onClick={handleLogin} 
                className="login-button"
                disabled={isLoggingIn}
              >
                <i className="fas fa-sign-in-alt"></i>
                <span>{isLoggingIn ? 'Signing in...' : 'Login'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 