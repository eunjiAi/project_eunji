import React from 'react';
import './Footer.css'; // CSS 파일 불러오기

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <div className="footer-logo">
            <span className="footer-project-name">OspreyAI</span>
          </div>
          <p className="footer-description">
            OspreyAI
          </p>
        </div>
        <div className="footer-right">
          <div className="footer-links">
            <a href="/about" className="footer-link">About Us</a>
            <a href="/services" className="footer-link">Services</a>
            <a href="/contact" className="footer-link">Contact</a>
            <a href="/privacy" className="footer-link">Privacy Policy</a>
          </div>
          <div className="footer-socials">
            <a href="https://twitter.com" className="footer-social-link" aria-label="Twitter">
              <img src="path/to/twitter-icon.png" alt="Twitter" />
            </a>
            <a href="https://facebook.com" className="footer-social-link" aria-label="Facebook">
              <img src="path/to/facebook-icon.png" alt="Facebook" />
            </a>

          </div>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; 2024 OspreyAI. All Rights Reserved.
      </div>
    </footer>
  );
}

export default Footer;
