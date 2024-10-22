import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Home.css 파일 불러오기

function Home() {
  return (
    <div className="home-container">
      <section className="hero">
        <h1 className="hero-title">ProjectEJ</h1>
        <p className="hero-description">
          무슨말무슨말무슨말무슨말무슨말무슨말무슨말무슨말
        </p>
      </section>
      <section className="features">
        <Link to="/" className="feature">
          <h2 className="feature-title">첫번째</h2>
          <p className="feature-description">무슨말무슨말무슨말무슨말무슨말</p>
        </Link>
        <Link to="/about" className="feature">
          <h2 className="feature-title">두번째</h2>
          <p className="feature-description">무슨말무슨말무슨말무슨말무슨말</p>
        </Link>
        <Link to="/upload" className="feature">
          <h2 className="feature-title">세번째</h2>
          <p className="feature-description">무슨말무슨말무슨말무슨말무슨말</p>
        </Link>
      </section>
    </div>
  );
}

export default Home;
