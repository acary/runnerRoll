import React from 'react';
import { useAuth } from '../context/AuthContext';
import './AccountSettings.css';

const AccountSettings = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="account-settings-container">
      <header className="account-header">
        <h1>Account Settings</h1>
      </header>

      <div className="account-content">
        <div className="profile-section">
          <div className="profile-photo-container">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} className="profile-photo" />
            ) : (
              <div className="profile-photo-placeholder">
                <i className="fas fa-user-circle"></i>
              </div>
            )}
          </div>
          <div className="profile-info">
            <h2>{user.displayName}</h2>
            <p className="email">{user.email}</p>
            <p className="joined-date">
              Joined {new Date(user.metadata.creationTime).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="account-details">
          <div className="detail-section">
            <h3>Account Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Name</label>
                <span>{user.displayName}</span>
              </div>
              <div className="detail-item">
                <label>Email</label>
                <span>{user.email}</span>
              </div>
              <div className="detail-item">
                <label>Account Type</label>
                <span>Google Account</span>
              </div>
              <div className="detail-item">
                <label>Last Sign In</label>
                <span>{new Date(user.metadata.lastSignInTime).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings; 