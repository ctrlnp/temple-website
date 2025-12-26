import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function Home() {
  return (
    <>
      {/* Title at top left */}
      <h1 className="home-title">Annapurneshwari Temple</h1>

      {/* Full width hero image */}
      <div className="hero-image-container">
        <img
          src="/images/annapurneshwari.jpeg"
          alt="Annapurneshwari Temple"
          className="hero-image"
        />
      </div>

      {/* Fixed bottom navigation */}
      <nav className="bottom-nav">
        <div className="nav-links-left">
          <Link to="/" className="nav-link">About Us</Link>
          <Link to="/gallery" className="nav-link">Gallery</Link>
          <Link to="/seva" className="nav-link">Seva</Link>
          <Link to="/contact" className="nav-link">Contact Us</Link>
        </div>
        <Link to="/login" className="nav-link-admin">
          Admin Login
        </Link>
      </nav>
    </>
  );
}

export default Home;

