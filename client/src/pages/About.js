import React from 'react';
import { Link } from 'react-router-dom';
import { isAdmin } from '../utils/auth';
import '../App.css';

function About() {
  return (
    <div className="about-page">
      {/* Title at top left */}
      <h1 className="home-title">Annapurneshwari Temple</h1>

      {/* Main Content */}
      <div className="about-container">
        <div className="about-header">
          <h2 className="about-title">About Us</h2>
          <p className="about-subtitle">Learn about the history and significance of Annapurneshwari Temple</p>
        </div>

        <div className="about-content">
          <div className="about-section">
            <h3>Our History</h3>
            <p>
              Annapurneshwari Temple has been serving the community for generations, providing spiritual guidance,
              cultural preservation, and a place of worship dedicated to Goddess Annapurneshwari.
            </p>
            <p>
              The temple was established with the vision of creating a sacred space where devotees can connect
              with their spiritual roots and participate in traditional rituals and festivals.
            </p>
          </div>

          <div className="about-section">
            <h3>Goddess Annapurneshwari</h3>
            <p>
              Goddess Annapurneshwari is the divine manifestation of Parvati, the consort of Lord Shiva.
              She is revered as the provider of food and nourishment, symbolizing abundance and prosperity.
            </p>
            <p>
              The name "Annapurna" comes from Sanskrit - "Anna" meaning food and "Purna" meaning complete or full.
              Devotees seek her blessings for health, wealth, and spiritual fulfillment.
            </p>
          </div>

          <div className="about-section">
            <h3>Our Mission</h3>
            <p>
              Our mission is to preserve ancient traditions, foster spiritual growth, and serve the community
              through religious ceremonies, educational programs, and charitable activities.
            </p>
            <p>
              We strive to maintain the cultural heritage while adapting to modern needs, ensuring that
              the temple remains a vibrant center of spiritual and cultural life for all generations.
            </p>
          </div>

          <div className="about-section">
            <h3>Temple Activities</h3>
            <ul>
              <li><strong>Daily Poojas:</strong> Regular worship ceremonies performed by qualified priests</li>
              <li><strong>Festival Celebrations:</strong> Special events during major Hindu festivals</li>
              <li><strong>Marriage Services:</strong> Traditional wedding ceremonies</li>
              <li><strong>Educational Programs:</strong> Religious classes and cultural workshops</li>
              <li><strong>Charitable Work:</strong> Community service and support for those in need</li>
            </ul>
          </div>

          <div className="about-section">
            <h3>Visit Us</h3>
            <p>
              We welcome all devotees and visitors to experience the divine presence and participate
              in our spiritual activities. The temple is open daily for worship and special ceremonies.
            </p>
            <p>
              For more information about our services, timings, and upcoming events, please visit our
              contact page or reach out to our temple administration.
            </p>
          </div>
        </div>
      </div>

      {/* Fixed top navigation */}
      <nav className="top-nav">
        <div className="nav-links">
          {isAdmin() && (
            <Link to="/upload" className="nav-link admin-dashboard">Admin Dashboard</Link>
          )}
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/gallery" className="nav-link">Gallery</Link>
          <Link to="/seva" className="nav-link">Seva</Link>
          <Link to="/contact" className="nav-link">Contact Us</Link>
        </div>
      </nav>
    </div>
  );
}

export default About;
