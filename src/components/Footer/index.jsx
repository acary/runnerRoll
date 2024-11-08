import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <p>&copy; {currentYear} RunnerRoll. All rights reserved.</p>
        </div>
        <div className="footer-right">
          <a href="/">Privacy Policy</a>
          <a href="/">Terms of Service</a>
          <a href="/">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 