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
              currentItem.embedUrl ? (
                <iframe
                  src={currentItem.embedUrl}
                  title={currentItem.title || 'Temple video'}
                  className="media-viewer-video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="media-viewer-video">
                  <p>Video not available</p>
                </div>
              )
            ) : (
              <img
                src={currentItem.imageUrl || currentItem.url}
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
