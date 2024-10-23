import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Home.css 파일 불러오기
import robotImage from '../../images/robot1.png';

function Home() {
  return (
    <div className="home-container">
      <section className="hero">
        <h1 className="hero-title">OspreyAI</h1>
        <p className="hero-description">
          실시간 비전 모니터링 AI 시스템
        </p>
      </section>
      <section className="features">
        <Link to="/WebcamCapture" className="feature">
          <div className="feature-icon">

            <img src={robotImage} alt="AI Process" />
          </div>
          <h2 className="feature-title">Real-time Process AI</h2>
          <p className="feature-description">OspreyAI</p>
        </Link>
      </section>
    </div>
  );
}

export default Home;
