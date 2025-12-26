import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function Contact() {
  return (
    <div className="contact-page">
      {/* Title at top left */}
      <h1 className="home-title">Annapurneshwari Temple</h1>

      {/* Main Content */}
      <div className="contact-container">
        <div className="contact-header">
          <h2 className="contact-title">Contact Us</h2>
          <p className="contact-subtitle">Get in touch with the temple</p>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <div className="info-section">
              <h3>Temple Address</h3>
              <p>
                Annapurneshwari Temple<br />
                Temple Street, Main Road<br />
                City Name, State - 123456<br />
                Karnataka, India
              </p>
            </div>

            <div className="info-section">
              <h3>Contact Details</h3>
              <p>
                <strong>Phone:</strong> +91 98765 43210<br />
                <strong>Email:</strong> info@annapurneshwaritemple.org<br />
                <strong>Website:</strong> www.annapurneshwaritemple.org
              </p>
            </div>

            <div className="info-section">
              <h3>Temple Timings</h3>
              <p>
                <strong>Morning:</strong> 6:00 AM - 12:00 PM<br />
                <strong>Evening:</strong> 4:00 PM - 8:00 PM<br />
                <strong>Special Poojas:</strong> As per schedule
              </p>
            </div>

            <div className="info-section">
              <h3>Pooja Services</h3>
              <p>
                <strong>Daily Pooja:</strong> 7:00 AM & 6:00 PM<br />
                <strong>Special Poojas:</strong> Saturdays & Festival days<br />
                <strong>Marriage Services:</strong> Available upon request
              </p>
            </div>
          </div>

          <div className="contact-form">
            <h3>Send us a Message</h3>
            <form className="contact-form-element">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <select id="subject" name="subject" required>
                  <option value="">Select a subject</option>
                  <option value="pooja">Pooja Booking</option>
                  <option value="donation">Donation Inquiry</option>
                  <option value="marriage">Marriage Services</option>
                  <option value="general">General Inquiry</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  placeholder="Please enter your message here..."
                  required
                ></textarea>
              </div>

              <button type="submit" className="contact-submit-btn">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Fixed bottom navigation */}
      <nav className="bottom-nav">
        <div className="nav-links-left">
          <Link to="/" className="nav-link">About Us</Link>
          <Link to="/gallery" className="nav-link">Gallery</Link>
          <Link to="/seva" className="nav-link">Seva</Link>
          <Link to="/contact" className="nav-link active">Contact Us</Link>
        </div>
      </nav>
    </div>
  );
}

export default Contact;
