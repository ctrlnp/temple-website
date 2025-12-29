import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { isAdmin } from '../utils/auth';
import '../App.css';

function Seva() {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  console.log('🔄 Seva component render, lastUpdated:', lastUpdated);

  useEffect(() => {
    fetchActiveQrCode();
  }, [lastUpdated]);

  // Listen for QR code updates from admin dashboard
  useEffect(() => {
    let lastUpdateTime = 0;
    const UPDATE_THROTTLE = 1000; // Only update once per second

    const handleStorageChange = (e) => {
      if (e.key === 'qrCodeUpdated') {
        const now = Date.now();
        if (now - lastUpdateTime > UPDATE_THROTTLE) {
          console.log('🔄 QR code update detected, refreshing...');
          lastUpdateTime = now;
          setLastUpdated(now);
        }
      }
    };

    const handleQrUpdate = () => {
      const now = Date.now();
      if (now - lastUpdateTime > UPDATE_THROTTLE) {
        console.log('🔄 QR code update event received, refreshing...');
        lastUpdateTime = now;
        setLastUpdated(now);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('qrCodeUpdated', handleQrUpdate);

    // Also poll for updates every 30 seconds as a fallback
    const pollInterval = setInterval(() => {
      console.log('🔄 Polling for QR code updates...');
      setLastUpdated(Date.now());
    }, 30000); // 30 seconds

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('qrCodeUpdated', handleQrUpdate);
      clearInterval(pollInterval);
    };
  }, []);

  // Memoize QR code display to prevent unnecessary re-renders
  const qrCodeDisplay = useMemo(() => {
    console.log('🎴 Rendering QR code display, qrCode:', qrCode?.title);

    if (loading) {
      return <div className="loading">Loading donation information...</div>;
    }

    if (!qrCode) {
      return (
        <div className="qr-container">
          <div className="qr-code">
            <img
              src="/images/default-qr.png"
              alt="Default QR Code"
              className="qr-image"
            />
          </div>
          <p className="qr-text">Temple Donation</p>
          <p className="qr-description">Scan this QR code to make a donation to the temple</p>
          <p className="qr-amount"><strong>Any Amount</strong></p>
          <p className="qr-event"><em>General Donation</em></p>
        </div>
      );
    }

    return (
      <div className="qr-container">
        <div className="qr-code">
          <img
            src={qrCode.qrImageUrl}
            alt={`${qrCode.title} QR Code`}
            className="qr-image"
            onError={(e) => {
              e.target.src = '/images/default-qr.png';
            }}
          />
        </div>
        <p className="qr-text">{qrCode.title}</p>
        <p className="qr-description">{qrCode.description}</p>
        <p className="qr-amount"><strong>{qrCode.amount}</strong></p>
        <p className="qr-event"><em>{qrCode.eventName}</em></p>
      </div>
    );
  }, [qrCode, loading]);


  const fetchActiveQrCode = async () => {
    try {
      console.log('🔄 Fetching active QR code...');
      const response = await fetch('http://localhost:5000/api/qr/active');
      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📱 QR code data received:', data);

      if (data && data.title) {
        setQrCode(data);
        console.log('✅ QR code set successfully:', data.title);
      } else {
        console.log('⚠️ No active QR code found, using fallback');
        // Fallback to default QR code
        setQrCode({
          title: 'Temple Donation',
          description: 'Scan this QR code to make a donation to the temple',
          qrImageUrl: '/images/default-qr.png',
          eventName: 'General Donation',
          amount: 'Any Amount'
        });
      }
    } catch (error) {
      console.error('❌ Error fetching QR code:', error);
      // Fallback to default QR code
      setQrCode({
        title: 'Temple Donation',
        description: 'Scan this QR code to make a donation to the temple',
        qrImageUrl: '/images/default-qr.png',
        eventName: 'General Donation',
        amount: 'Any Amount'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="seva-page">
        <h1 className="home-title">Annapurneshwari Temple</h1>
        <div className="loading">Loading donation information...</div>
      </div>
    );
  }

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

            <div className="admin-controls">
              <button onClick={() => setLastUpdated(Date.now())} className="refresh-btn">
                🔄 Refresh QR Code
              </button>
              <small>Click to load the latest QR code changes</small>
            </div>

            {qrCodeDisplay}
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
          {isAdmin() && (
            <Link to="/upload" className="nav-link admin-dashboard">Admin Dashboard</Link>
          )}
          <Link to="/about" className="nav-link">About Us</Link>
          <Link to="/gallery" className="nav-link">Gallery</Link>
          <Link to="/seva" className="nav-link active">Seva</Link>
          <Link to="/contact" className="nav-link">Contact Us</Link>
        </div>
      </nav>
    </div>
  );
}

export default Seva;
