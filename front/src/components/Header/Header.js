import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css'; // 추가된 CSS 파일 경로

function Header() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <span className="project-name">ProjectEJ</span>
        </div>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/" className="navbar-link">Home</Link>
          </li>
          <li className="navbar-item dropdown">
            <Link to="/about" className="navbar-link">About</Link>
            <ul className="dropdown-menu">
              <li><Link to="/about/team" className="dropdown-link">Our Team</Link></li>
              <li><Link to="/about/careers" className="dropdown-link">Careers</Link></li>
            </ul>
          </li>
          <li className="navbar-item dropdown">
            <Link to="/upload" className="navbar-link">Upload</Link>
            <ul className="dropdown-menu">
              <li><Link to="/upload/images" className="dropdown-link">Upload Images</Link></li>
              <li><Link to="/upload/documents" className="dropdown-link">Upload Documents</Link></li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Header;
