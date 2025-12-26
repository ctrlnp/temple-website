import React from 'react';
import '../App.css';

function MediaViewer({ media, currentIndex, onClose, onNext, onPrevious, eventName }) {
  if (!media || media.length === 0) return null;

  const currentItem = media[currentIndex];
  const isVideo = currentItem.type === 'video';
  const hasNext = currentIndex < media.length - 1;
  const hasPrevious = currentIndex > 0;

  return (
    <div className="media-viewer-overlay" onClick={onClose}>
      <div className="media-viewer-container" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="media-viewer-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        {/* Navigation buttons */}
        {hasPrevious && (
          <button
            className="media-viewer-nav media-viewer-prev"
            onClick={onPrevious}
            aria-label="Previous"
          >
            ‹
          </button>
        )}
        {hasNext && (
          <button
            className="media-viewer-nav media-viewer-next"
            onClick={onNext}
            aria-label="Next"
          >
            ›
          </button>
        )}

        {/* Media content */}
        <div className="media-viewer-content">
          <div className="media-viewer-media">
            {isVideo ? (
              <video
                src={`http://localhost:5000${currentItem.filePath}`}
                controls
                autoPlay
                className="media-viewer-video"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={`http://localhost:5000${currentItem.filePath}`}
                alt={currentItem.title || 'Gallery image'}
                className="media-viewer-image"
              />
            )}
          </div>

          {/* Description panel */}
          <div className="media-viewer-info">
            <div className="media-viewer-header">
              <h3 className="media-viewer-title">{currentItem.title || 'Untitled'}</h3>
              <span className="media-viewer-counter">
                {currentIndex + 1} / {media.length}
              </span>
            </div>
            {eventName && (
              <p className="media-viewer-event">{eventName}</p>
            )}
            {currentItem.description && (
              <p className="media-viewer-description">{currentItem.description}</p>
            )}
            {currentItem.eventDate && (
              <p className="media-viewer-date">
                {new Date(currentItem.eventDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MediaViewer;

