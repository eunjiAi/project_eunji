import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import WebcamCapture from './pages/WebcamCapture/WebcamCapture';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/WebcamCapture" element={<WebcamCapture />} />
        <Route path="/about" element={<div>About Page</div>} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
