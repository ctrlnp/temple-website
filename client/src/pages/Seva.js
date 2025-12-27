import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function Seva() {
  return (
    <div className="seva-page">
      {/* Title at top left */}
      <h1 className="home-title">Annapurneshwari Temple</h1>

      {/* Main Content */}
      <div className="seva-container">
        <div className="seva-header">
          <h2 className="seva-title">Seva (Service)</h2>
          <p className="seva-subtitle">Support the temple through donations</p>
        </div>

        <div className="seva-content">
          <div className="donation-section">
            <h3>Make a Donation</h3>
            <p>Your generous contributions help maintain and develop our temple activities.</p>

            <div className="qr-container">
              <div className="qr-code">
                {/* Placeholder for QR code - you can replace with actual QR code image */}
                <div className="qr-placeholder">
                  <div className="qr-grid">
                    {/* Simple QR code pattern */}
                    <div className="qr-square"></div>
                    <div className="qr-square"></div>
                    <div className="qr-square"></div>
                    <div className="qr-square"></div>
                    <div className="qr-square"></div>
                    <div className="qr-square"></div>
                    <div className="qr-square"></div>
                    <div className="qr-square"></div>
                    <div className="qr-square"></div>
                    <div className="qr-square"></div>
                    <div className="qr-square"></div>
                    <div className="qr-square"></div>
                    <div className="qr-square"></div>
                    <div className="qr-square"></div>
                    <div className="qr-square"></div>
                    <div className="qr-square"></div>
                  </div>
                </div>
              </div>
              <p className="qr-text">Scan to Donate</p>
              <p className="qr-description">Use any UPI app to scan and contribute</p>
            </div>
          </div>

          <div className="seva-info">
            <h3>Seva Opportunities</h3>
            <ul>
              <li>Temple Maintenance</li>
              <li>Pooja Materials</li>
              <li>Festive Celebrations</li>
              <li>Community Programs</li>
              <li>Educational Initiatives</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Fixed top navigation */}
      <nav className="top-nav">
        <div className="nav-links">
          <Link to="/" className="nav-link">About Us</Link>
          <Link to="/gallery" className="nav-link">Gallery</Link>
          <Link to="/seva" className="nav-link active">Seva</Link>
          <Link to="/contact" className="nav-link">Contact Us</Link>
        </div>
      </nav>
    </div>
  );
}

export default Seva;
