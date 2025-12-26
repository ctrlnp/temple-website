import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

function Upload() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventName: '',
    type: 'image',
    eventDate: '',
  });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      // Auto-detect if there are videos
      const hasVideos = selectedFiles.some((file) => file.type.startsWith('video/'));
      const hasImages = selectedFiles.some((file) => file.type.startsWith('image/'));
      
      // Set type based on what's selected (mixed if both)
      if (hasVideos && hasImages) {
        setFormData((prev) => ({ ...prev, type: 'mixed' }));
      } else if (hasVideos) {
        setFormData((prev) => ({ ...prev, type: 'video' }));
      } else {
        setFormData((prev) => ({ ...prev, type: 'image' }));
      }
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setMessage('Please select at least one file');
      return;
    }

    setUploading(true);
    setMessage('');
    setUploadProgress({});

    const formDataToSend = new FormData();
    // Add form fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value && key !== 'type') {
        formDataToSend.append(key, value);
      }
    });
    
    // Add all files
    files.forEach((file) => {
      formDataToSend.append('files', file);
    });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/media', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (res.ok) {
        const result = await res.json();
        setMessage(`✅ Successfully uploaded ${result.media?.length || files.length} file(s)!`);
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          eventName: '',
          type: 'image',
          eventDate: '',
        });
        setFiles([]);
        setUploadProgress({});
        // Reset file input
        e.target.reset();
        
        // Optionally navigate to gallery after 2 seconds
        setTimeout(() => {
          navigate('/gallery');
        }, 2000);
      } else {
        const error = await res.json();
        setMessage(`❌ Error: ${error.message || 'Upload failed'}`);
      }
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      {/* Title at top left */}
      <h1 className="home-title">Annapurneshwari Temple</h1>

      {/* Upload Form */}
      <div className="upload-container">
        <div className="upload-header">
          <h2 className="upload-title">Upload Photos & Videos</h2>
          <p className="upload-subtitle">Add media for temple events</p>
        </div>

        <form className="upload-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="eventName">Event Name *</label>
            <input
              id="eventName"
              name="eventName"
              type="text"
              value={formData.eventName}
              onChange={handleChange}
              placeholder="e.g., Navaratri 2025, Annual Rathotsava"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Morning Aarti, Temple Decorations"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="eventDate">Event Date</label>
            <input
              id="eventDate"
              name="eventDate"
              type="date"
              value={formData.eventDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Media Type</label>
            <select id="type" name="type" value={formData.type} onChange={handleChange} disabled>
              <option value="image">Photos</option>
              <option value="video">Videos</option>
              <option value="mixed">Mixed (Photos & Videos)</option>
            </select>
            <small>Auto-detected from selected files</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional description of the photo/video"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="files">Select Files * (Multiple files allowed)</label>
            <input
              id="files"
              name="files"
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              multiple
              required
            />
            <small>
              Supported: Images (JPG, PNG, WebP) and Videos (MP4). You can select multiple files at
              once. Max file size depends on server settings.
            </small>
            {files.length > 0 && (
              <div className="files-list">
                <strong>Selected Files ({files.length}):</strong>
                <div className="files-preview">
                  {files.map((file, index) => {
                    const isVideo = file.type.startsWith('video/');
                    return (
                      <div key={index} className="file-item">
                        <span className="file-icon">{isVideo ? '🎥' : '📷'}</span>
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="file-remove"
                          aria-label="Remove file"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <button type="submit" className="upload-button" disabled={uploading || files.length === 0}>
            {uploading
              ? `Uploading ${files.length} file(s)...`
              : `Upload ${files.length > 0 ? `${files.length} ` : ''}Media`}
          </button>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Link to="/gallery" className="view-gallery-link">
              View Gallery →
            </Link>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
              }}
              className="logout-button"
            >
              Logout
            </button>
          </div>
        </form>
      </div>

      {/* Fixed bottom navigation */}
      <nav className="bottom-nav">
        <div className="nav-links-left">
          <Link to="/" className="nav-link">About Us</Link>
          <Link to="/gallery" className="nav-link">Gallery</Link>
          <Link to="/seva" className="nav-link">Seva</Link>
          <Link to="/contact" className="nav-link">Contact Us</Link>
        </div>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          }}
          className="nav-link-admin"
        >
          Logout
        </button>
      </nav>
    </div>
  );
}

export default Upload;

