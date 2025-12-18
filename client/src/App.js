import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [mediaItems, setMediaItems] = useState([]);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    eventName: '',
    type: 'image',
    eventDate: '',
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/media')
      .then((res) => res.json())
      .then(setMediaItems)
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUploadForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    Object.entries(uploadForm).forEach(([key, value]) => formData.append(key, value));
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:5000/api/media', {
        method: 'POST',
        body: formData,
      });
      const created = await res.json();
      if (res.ok) {
        setMediaItems((prev) => [created, ...prev]);
        setUploadForm({
          title: '',
          description: '',
          eventName: '',
          type: 'image',
          eventDate: '',
        });
        setFile(null);
      }
    } catch {
      // ignore simple errors for now
    }
  };

  return (
    <div className="App">
      {/* Left rail */}
      <aside className="side-rail">
        <div className="side-top">
          <button className="icon-button" aria-label="Menu">
            <span className="icon-hamburger" />
          </button>
          <div className="logo-mark">॥</div>
        </div>
        <div className="side-dots">
          <span className="dot active" />
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </aside>

      {/* Top navigation */}
      <header className="top-nav">
        <nav className="top-links">
          <a href="#culture">Culture</a>
          <a href="#darshan">Darshan</a>
          <a href="#sevas">Sevas</a>
          <a href="#planner">Trip Planner</a>
        </nav>
        <button className="icon-button search-button" aria-label="Search">
          🔍
        </button>
      </header>

      {/* Main hero */}
      <main className="hero-layout">
        <section className="hero-copy">
          <p className="hero-kicker">TRAVEL TO</p>
          <h1 className="hero-heading">
            Annapurneshwari
            <span className="hero-dot">.</span>
          </h1>
          <p className="hero-body">
            Tourism to Annapurneshwari Devi is one of the most cherished spiritual journeys in
            Karnataka. Devotees from across India visit Horanadu to seek blessings, experience the
            sacred ambience of the temple, and immerse themselves in centuries-old traditions.
          </p>
          <button className="cta-button">LEARN MORE</button>
        </section>

        <section className="hero-visual" aria-hidden="true">
          <div className="sun-circle" />
          <div className="image-frame">
            <img
              src="/images/annapurneshwari.jpg"
              alt="Goddess Annapurneshwari idol decorated with flowers and lamps"
              className="devi-image"
            />
          </div>
        </section>
      </main>

      {/* Events & Gallery */}
      <section className="media-section" id="events">
        <div className="media-inner">
          <div className="media-header">
            <div>
              <p className="media-kicker">Temple Events</p>
              <h2 className="media-heading">Photos &amp; Videos from Special Occasions</h2>
              <p className="media-sub">
                Temple administrators can upload photos and videos for specific events. Devotees
                can relive the divine moments anytime.
              </p>
            </div>

            <form className="media-form" onSubmit={handleUpload}>
              <h3>Upload New Media</h3>
              <input
                name="title"
                value={uploadForm.title}
                onChange={handleChange}
                placeholder="Title"
                required
              />
              <input
                name="eventName"
                value={uploadForm.eventName}
                onChange={handleChange}
                placeholder="Event name (e.g., Navaratri 2025)"
                required
              />
              <input
                name="eventDate"
                type="date"
                value={uploadForm.eventDate}
                onChange={handleChange}
              />
              <select name="type" value={uploadForm.type} onChange={handleChange}>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
              <textarea
                name="description"
                value={uploadForm.description}
                onChange={handleChange}
                placeholder="Short description (optional)"
                rows="2"
              />
              <input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files[0])} required />
              <button type="submit" className="cta-button upload-button">
                Upload
              </button>
            </form>
          </div>

          <div className="media-grid">
            {mediaItems.map((item) => (
              <article key={item._id} className="media-card">
                <div className="media-thumb">
                  {item.type === 'video' ? (
                    <video src={`http://localhost:5000${item.filePath}`} controls />
                  ) : (
                    <img src={`http://localhost:5000${item.filePath}`} alt={item.title} />
                  )}
                </div>
                <div className="media-info">
                  <h4>{item.title}</h4>
                  <p className="media-event">{item.eventName}</p>
                  {item.description && <p className="media-desc">{item.description}</p>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;