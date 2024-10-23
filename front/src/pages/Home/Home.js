import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Home.css 파일 불러오기

function Home() {
  return (
    <div className="home-container">
      <section className="hero">
        <h1 className="hero-title">ProjectEJ</h1>
        <p className="hero-description">
        classification 이미지 분류
        </p>
      </section>
      <section className="features">

        <Link to="/about" className="feature">
          <h2 className="feature-title">classification1</h2>
          <p className="feature-description">classification1</p>
        </Link>
        <Link to="/WebcamCapture" className="feature">
          <h2 className="feature-title">classification2</h2>
          <p className="feature-description">classification2</p>
        </Link>
      </section>
    </div>
  );
}

export default Home;
