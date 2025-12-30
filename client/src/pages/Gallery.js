import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MediaViewer from '../components/MediaViewer';
import { isAdmin } from '../utils/auth';
import ThemeToggle from '../components/ThemeToggle';
import '../App.css';

function Gallery() {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [currentMediaType, setCurrentMediaType] = useState(null); // 'photos' or 'videos'
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch('http://localhost:5000/api/media')
      .then((res) => res.json())
      .then((data) => {
        setMediaItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching media:', err);
        setLoading(false);
      });
  }, []);

  // Group media by event
  const groupedByEvent = mediaItems.reduce((acc, item) => {
    const eventName = item.eventName || 'Other Events';
    if (!acc[eventName]) {
      acc[eventName] = { photos: [], videos: [] };
    }
    if (item.type === 'image') {
      acc[eventName].photos.push(item);
    } else if (item.type === 'video') {
      acc[eventName].videos.push(item);
    }
    return acc;
  }, {});

  const events = Object.keys(groupedByEvent).sort();

  // Open viewer when clicking on a media item
  const openViewer = (eventName, mediaType, index) => {
    setCurrentEvent(eventName);
    setCurrentMediaType(mediaType);
    setCurrentIndex(index);
    setViewerOpen(true);
  };

  // Close viewer
  const closeViewer = () => {
    setViewerOpen(false);
  };

  // Navigate to next item
  const nextItem = () => {
    if (currentEvent && currentMediaType) {
      const media = groupedByEvent[currentEvent][currentMediaType];
      if (currentIndex < media.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }
  };

  // Navigate to previous item
  const previousItem = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Get current media array for viewer
  const getCurrentMedia = () => {
    if (currentEvent && currentMediaType) {
      return groupedByEvent[currentEvent][currentMediaType] || [];
    }
    return [];
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!viewerOpen) return;

    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight') {
        nextItem();
      }
      if (e.key === 'ArrowLeft') {
        previousItem();
      }
      if (e.key === 'Escape') {
        closeViewer();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerOpen, currentIndex, currentEvent, currentMediaType]);

  return (
    <div className="gallery-page">
      {/* Title at top left */}
      <h1 className="home-title">Annapurneshwari Temple</h1>

      {/* Gallery Content */}
      <div className="gallery-container">
        <div className="gallery-header">
          <h2 className="gallery-title">Gallery</h2>
          <p className="gallery-subtitle">Photos and Videos from Temple Events</p>
        </div>

        {loading ? (
          <div className="loading">Loading gallery...</div>
        ) : events.length === 0 ? (
          <div className="empty-gallery">
            <p>No media available yet. Check back soon for photos and videos from temple events.</p>
          </div>
        ) : (
          <div className="gallery-content">
            {events.map((eventName) => {
              const { photos, videos } = groupedByEvent[eventName];
              return (
                <div key={eventName} className="event-section">
                  <h3 className="event-title">{eventName}</h3>

                  {/* Photos Section */}
                  {photos.length > 0 && (
                    <div className="media-type-section">
                      <h4 className="media-type-title">📷 Photos</h4>
                      <div className="media-grid">
                        {photos.map((item, index) => (
                          <div
                            key={item._id}
                            className="gallery-item"
                            onClick={() => openViewer(eventName, 'photos', index)}
                          >
                            <div className="gallery-item-image">
                              <img
                                src={item.imageUrl || item.url}
                                alt={item.title || 'Temple photo'}
                                loading="lazy"
                              />
                              <div className="gallery-item-overlay">
                                <span className="gallery-item-icon">🔍</span>
                              </div>
                            </div>
                            {item.title && (
                              <div className="gallery-item-info">
                                <p className="gallery-item-title">{item.title}</p>
                                {item.description && (
                                  <p className="gallery-item-desc">{item.description}</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Videos Section */}
                  {videos.length > 0 && (
                    <div className="media-type-section">
                      <h4 className="media-type-title">🎥 Videos</h4>
                      <div className="media-grid">
                        {videos.map((item, index) => (
                          <div
                            key={item._id}
                            className="gallery-item"
                            onClick={() => openViewer(eventName, 'videos', index)}
                          >
                            <div className="gallery-item-image">
                              <img
                                src={item.thumbnailUrl || item.thumbnail}
                                alt={item.title || 'Temple video'}
                                loading="lazy"
                              />
                              <div className="gallery-item-overlay">
                                <span className="gallery-item-icon">▶️</span>
                              </div>
                            </div>
                            {item.title && (
                              <div className="gallery-item-info">
                                <p className="gallery-item-title">{item.title}</p>
                                {item.description && (
                                  <p className="gallery-item-desc">{item.description}</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Media Viewer Modal */}
      {viewerOpen && (
        <MediaViewer
          media={getCurrentMedia()}
          currentIndex={currentIndex}
          onClose={closeViewer}
          onNext={nextItem}
          onPrevious={previousItem}
          eventName={currentEvent}
        />
      )}

      {/* Fixed top navigation */}
      <nav className="top-nav">
        <div className="nav-links">
          {isAdmin() && (
            <Link to="/upload" className="nav-link admin-dashboard">Admin Dashboard</Link>
          )}
          <Link to="/about" className="nav-link">About Us</Link>
          <Link to="/gallery" className="nav-link active">Gallery</Link>
          <Link to="/seva" className="nav-link">Seva</Link>
          <Link to="/contact" className="nav-link">Contact Us</Link>
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}

export default Gallery;
