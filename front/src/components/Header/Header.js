import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css'; // 추가된 CSS 파일 경로

function Header() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/" className="project-name">OspreyAI</Link> {/* 프로젝트 이름에 Home 링크 추가 */}
        </div>

        <ul className="navbar-menu">

          <li className="navbar-item dropdown">
            <Link to="/WebcamCapture" className="navbar-link">RealTimeProcessAI</Link>
            <ul className="dropdown-menu">
              <li><Link to="/about/team" className="dropdown-link">Our Team</Link></li>
              <li><Link to="/about/careers" className="dropdown-link">Careers</Link></li>
            </ul>
          </li>

          <li className="navbar-item dropdown">
            <Link to="/upload" className="navbar-link">Contact Us</Link>
            <ul className="dropdown-menu">
              <li><Link to="/upload/images" className="dropdown-link">Upload Images</Link></li>
              <li><Link to="/upload/documents" className="dropdown-link">Upload Documents</Link></li>
            </ul>
          </li>

          <li className="navbar-item dropdown">
            <Link to="/Login" className="navbar-link">Login</Link>
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
