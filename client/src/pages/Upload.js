import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout, isAdmin } from '../utils/auth';
import '../App.css';

// BookingCalendarNavigation Component
const BookingCalendarNavigation = ({ selectedMonth, setSelectedMonth, currentMonth }) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateMonth = (direction) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(selectedMonth.getMonth() + direction);
    console.log(`🗓️ Navigating ${direction > 0 ? 'forward' : 'backward'} from ${selectedMonth.toDateString()} to ${newMonth.toDateString()}`);
    setSelectedMonth(newMonth);
  };

  return (
    <div className="calendar-navigation">
      <button
        className="nav-button"
        onClick={() => navigateMonth(-1)}
        disabled={selectedMonth <= currentMonth}
      >
        ← Previous
      </button>
      <h3>{monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}</h3>
      <button
        className="nav-button"
        onClick={() => navigateMonth(1)}
      >
        Next →
      </button>
    </div>
  );
};

// BookingCalendar Component
const BookingCalendar = ({ bookedDates = [], selectedDate, onDateSelect, loading = false }) => {
  const today = new Date();
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    const safeBookedDates = Array.isArray(bookedDates) ? bookedDates : [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      // Create date in local timezone to avoid timezone issues
      const localDate = new Date(year, month, day);
      // Format as YYYY-MM-DD in local time to match the booked dates format
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // Debug logging for date comparison - only for January 2026 dates
      if (dateString.startsWith('2026-01')) {
        console.log(`🎯 Checking JAN 2026 date ${dateString} against bookedDates:`, safeBookedDates);
      }

      const isBooked = safeBookedDates.some(bookedDate => {
        const dateMatch = bookedDate === dateString;

        if (dateMatch && dateString.startsWith('2026-01')) {
          console.log(`✅ Found match for JAN 2026: ${dateString} === ${bookedDate}`);
        }

        return dateMatch;
      });

      if (isBooked && dateString.startsWith('2026-01')) {
        console.log(`🔴 JAN 2026 Date ${dateString} is BOOKED`);
      }

      // Create a date object for today comparison (local time)
      const todayLocal = new Date();
      todayLocal.setHours(0, 0, 0, 0);
      const isPast = localDate < todayLocal;
      const isSelected = selectedDate === dateString;

      days.push({
        date: day,
        dateString,
        isBooked,
        isPast,
        isSelected
      });
    }

    return days;
  };

  // Generate calendar data for 4 months (current + next 3)
  const generateCalendarData = () => {
    const months = [];
    for (let i = 0; i < 4; i++) {
      const monthDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + i, 1);
      months.push({
        date: monthDate,
        days: getDaysInMonth(monthDate),
        monthName: monthNames[monthDate.getMonth()],
        year: monthDate.getFullYear()
      });
    }
    return months;
  };

  const calendarData = generateCalendarData();

  const handleDateClick = (day) => {
    if (day && !day.isPast && !day.isBooked) {
      onDateSelect(day.dateString);
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(selectedMonth.getMonth() + direction);
    console.log(`🗓️ Navigating ${direction > 0 ? 'forward' : 'backward'} from ${selectedMonth.toDateString()} to ${newMonth.toDateString()}`);
    setSelectedMonth(newMonth);
  };

  // Debug: log selectedMonth changes
  useEffect(() => {
    console.log('📅 selectedMonth changed to:', selectedMonth.toDateString());
  }, [selectedMonth]);

  return (
    <div className="booking-calendar-multi">
      {calendarData.map((monthData, monthIndex) => (
        <div key={monthIndex} className="calendar-month">
          <div className="calendar-header">
            <h4>{monthData.monthName} {monthData.year}</h4>
          </div>
          <div className="calendar-grid">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="calendar-day-header">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {monthData.days.map((day, index) => (
              <div
                key={index}
                className={`calendar-day ${day ? 'calendar-day-active' : ''} ${
                  day?.isPast ? 'calendar-day-past' : ''
                } ${
                  day?.isBooked ? 'calendar-day-booked' : ''
                } ${
                  day?.isSelected ? 'calendar-day-selected' : ''
                }`}
                onClick={() => handleDateClick(day)}
              >
                {day ? day.date : ''}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-color booked"></div>
          <span>Booked</span>
        </div>
        <div className="legend-item">
          <div className="legend-color selected"></div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload'); // 'upload', 'bookings', or 'qr'

  console.log('🔄 AdminDashboard render, activeTab:', activeTab);

  // Upload state
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    eventName: '',
    type: 'image',
    eventDate: '',
  });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadMessage, setUploadMessage] = useState('');
  const [youtubeAuthorized, setYoutubeAuthorized] = useState(false);
  const [authorizingYoutube, setAuthorizingYoutube] = useState(false);

  // Booking state
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [calendarSelectedMonth, setCalendarSelectedMonth] = useState(new Date());

  // Weekly events state
  const [weeklyEvents, setWeeklyEvents] = useState([]);
  const [loadingWeeklyEvents, setLoadingWeeklyEvents] = useState(false);
  const [bookingData, setBookingData] = useState({
    customerName: '',
    mobileNumber: '',
    eventDate: '',
    functionType: '',
    guestCount: '',
    address: ''
  });
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookedDates, setBookedDates] = useState([]);
  const [loadingBookedDates, setLoadingBookedDates] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  // QR Code state
  const [qrCodes, setQrCodes] = useState([]);
  const [loadingQrCodes, setLoadingQrCodes] = useState(false);
  const [qrMessage, setQrMessage] = useState('');
  const [qrData, setQrData] = useState({
    title: '',
    description: '',
    eventName: '',
    amount: '',
    qrCode: ''
  });
  const [qrImageFile, setQrImageFile] = useState(null);
  const [submittingQr, setSubmittingQr] = useState(false);
  const [editingQr, setEditingQr] = useState(null);

  // Debug: log when bookedDates changes
  useEffect(() => {
    console.log('🔄 bookedDates state changed:', bookedDates);
    console.log('🔄 Contains 2026-01-06:', bookedDates.includes('2026-01-06'));
  }, [bookedDates]);

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
      fetchBookedDates();
      fetchWeeklyEvents();
      debugBookings(); // Debug: check all bookings
    } else if (activeTab === 'qr') {
      fetchQrCodes();
    }
  }, [activeTab]);

  // Upload handlers
  const handleUploadChange = (e) => {
    const { name, value } = e.target;
    setUploadData((prev) => ({ ...prev, [name]: value }));
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
        setUploadData((prev) => ({ ...prev, type: 'mixed' }));
      } else if (hasVideos) {
        setUploadData((prev) => ({ ...prev, type: 'video' }));
      } else {
        setUploadData((prev) => ({ ...prev, type: 'image' }));
      }
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Booking handlers
  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/booking', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      setBookingMessage('Failed to load bookings');
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setSubmittingBooking(true);
    setBookingMessage('');

    try {
      console.log('📝 Booking data to send:', bookingData);
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);

      const response = await fetch('http://localhost:5000/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('📡 Response data:', data);

      if (response.ok) {
        setBookingMessage('✅ Booking created successfully!');
        // Reset form
        setBookingData({
          customerName: '',
          mobileNumber: '',
          eventDate: '',
          functionType: '',
          guestCount: '',
          address: ''
        });
        // Refresh bookings list
        fetchBookings();
      } else {
        setBookingMessage(`❌ Error: ${data.message || 'Booking failed'}`);
      }
    } catch (error) {
      setBookingMessage('❌ Network error. Please try again.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/booking/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setBookingMessage('✅ Booking status updated successfully!');
        fetchBookings();
        fetchBookedDates(); // Refresh booked dates after status change
      } else {
        setBookingMessage('❌ Failed to update booking status');
      }
    } catch (error) {
      setBookingMessage('❌ Network error. Please try again.');
    }
  };

  const fetchBookedDates = async () => {
    setLoadingBookedDates(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/booking/booked-dates', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log('📅 Fetched booked dates:', data);
      console.log('📅 Data type:', typeof data, Array.isArray(data));
      console.log('📅 Looking for 2026-01-06:', data.includes('2026-01-06'));
      console.log('📅 Setting bookedDates state...');

      const safeData = Array.isArray(data) ? data : [];
      setBookedDates(safeData);
      console.log('📅 bookedDates state set to:', safeData);
    } catch (error) {
      console.error('Error fetching booked dates:', error);
      setBookedDates([]);
    } finally {
      setLoadingBookedDates(false);
    }
  };

  // Debug function to check all bookings
  const debugBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/booking', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const bookings = await response.json();
      console.log('🔍 ALL BOOKINGS:', bookings);
      const jan2026Bookings = bookings.filter(b => b.eventDate.startsWith('2026-01'));
      console.log('🎯 JAN 2026 BOOKINGS:', jan2026Bookings);
    } catch (error) {
      console.error('Error fetching all bookings:', error);
    }
  };

  const fetchWeeklyEvents = async () => {
    setLoadingWeeklyEvents(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/booking/weekly', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log('Fetched weekly events:', data);
      setWeeklyEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching weekly events:', error);
      setWeeklyEvents([]);
    } finally {
      setLoadingWeeklyEvents(false);
    }
  };

  const checkDateAvailability = async (date) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/booking/check-availability?date=${date}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error('Error checking date availability:', error);
      return false;
    }
  };

  // QR Code handlers
  const handleQrChange = (e) => {
    const { name, value } = e.target;
    setQrData(prev => ({ ...prev, [name]: value }));
  };

  const handleQrImageChange = (e) => {
    const file = e.target.files[0];
    setQrImageFile(file);
  };

  const fetchQrCodes = async () => {
    setLoadingQrCodes(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/qr', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setQrCodes(data);
    } catch (error) {
      setQrMessage('Failed to load QR codes');
    } finally {
      setLoadingQrCodes(false);
    }
  };

  const handleQrSubmit = async (e) => {
    e.preventDefault();
    setQrMessage('');

    // Validate required fields
    if (!qrData.title || !qrData.description || !qrData.eventName || !qrData.amount) {
      setQrMessage('❌ Please fill in all required fields');
      return;
    }

    // Require image file only for new QR codes (not when editing)
    if (!editingQr && !qrImageFile) {
      setQrMessage('❌ Please select a QR code image');
      return;
    }

    setSubmittingQr(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      console.log('QR Submit - Data:', qrData);
      console.log('QR Submit - File:', qrImageFile);

      // Add form fields
      Object.entries(qrData).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
          console.log(`Form field ${key}:`, value);
        }
      });

      // Add image file if selected
      if (qrImageFile) {
        formData.append('qrImage', qrImageFile);
        console.log('Form file:', qrImageFile.name);
      } else {
        console.log('No file selected');
      }

      const url = editingQr ? `http://localhost:5000/api/qr/${editingQr._id}` : 'http://localhost:5000/api/qr';
      const method = editingQr ? 'PATCH' : 'POST';

      console.log('🚀 Sending QR request to:', url);
      console.log('🔑 Auth token present:', !!token);

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📄 Response data:', data);

      if (response.ok) {
        setQrMessage(`✅ QR code ${editingQr ? 'updated' : 'created'} successfully!`);
        setQrData({
          title: '',
          description: '',
          eventName: '',
          amount: '',
          qrCode: ''
        });
        setQrImageFile(null);
        setEditingQr(null);
        fetchQrCodes();

        // Notify Seva page to refresh QR code
        console.log('📢 Notifying Seva page of QR code update');
        localStorage.setItem('qrCodeUpdated', Date.now().toString());
        window.dispatchEvent(new Event('qrCodeUpdated'));
        // Also dispatch a custom event that can be listened to globally
        window.dispatchEvent(new CustomEvent('qrCodeUpdated', { detail: { timestamp: Date.now() } }));
        // Reset file input
        e.target.reset();
      } else {
        setQrMessage(`❌ Error: ${data.message || 'QR code operation failed'}`);
      }
    } catch (error) {
      setQrMessage('❌ Network error. Please try again.');
    } finally {
      setSubmittingQr(false);
    }
  };

  const editQrCode = (qrCode) => {
    setQrData({
      title: qrCode.title,
      description: qrCode.description,
      eventName: qrCode.eventName,
      amount: qrCode.amount,
      qrCode: qrCode.qrCode || ''
    });
    setEditingQr(qrCode);
    setActiveTab('qr');
  };

  const toggleQrActive = async (qrId, isActive) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/qr/${qrId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        setQrMessage('✅ QR code status updated successfully!');
        fetchQrCodes();

        // Notify Seva page to refresh QR code
        localStorage.setItem('qrCodeUpdated', Date.now().toString());
        window.dispatchEvent(new Event('qrCodeUpdated'));
      } else {
        setQrMessage('❌ Failed to update QR code status');
      }
    } catch (error) {
      setQrMessage('❌ Network error. Please try again.');
    }
  };

  const deleteQrCode = async (qrId) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Are you sure you want to delete this QR code?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/qr/${qrId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setQrMessage('✅ QR code deleted successfully!');
        fetchQrCodes();

        // Notify Seva page to refresh QR code
        localStorage.setItem('qrCodeUpdated', Date.now().toString());
        window.dispatchEvent(new Event('qrCodeUpdated'));
      } else {
        setQrMessage('❌ Failed to delete QR code');
      }
    } catch (error) {
      setQrMessage('❌ Network error. Please try again.');
    }
  };

  const authorizeYouTube = async () => {
    try {
      setAuthorizingYoutube(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/media/youtube/auth', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        // Redirect to YouTube authorization
        window.location.href = data.authUrl;
      } else {
        const error = await res.json();
        setUploadMessage(`❌ YouTube Auth Error: ${error.message}`);
      }
    } catch (err) {
      setUploadMessage(`❌ YouTube Auth Error: ${err.message}`);
    } finally {
      setAuthorizingYoutube(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setUploadMessage('Please select at least one file');
      return;
    }

    setUploading(true);
    setUploadMessage('');
    setUploadProgress({});

    const formDataToSend = new FormData();
    // Add form fields
    Object.entries(uploadData).forEach(([key, value]) => {
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
        setUploadMessage(`✅ Successfully uploaded ${result.media?.length || files.length} file(s)!`);
        
        // Reset form
        setUploadData({
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
      } else {
        const error = await res.json();
        setUploadMessage(`❌ Error: ${error.message || 'Upload failed'}`);
      }
    } catch (err) {
      setUploadMessage(`❌ Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // QR Code grid content
  let qrGridContent;
  if (loadingQrCodes) {
    qrGridContent = <div className="loading"><p>Loading QR codes...</p></div>;
  } else if (!qrCodes || qrCodes.length === 0) {
    qrGridContent = (
      <div className="empty-qr">
        <p>No QR codes created yet. Create your first QR code above.</p>
      </div>
    );
  } else {
    qrGridContent = (
      <div className="qr-grid">
        {qrCodes.map((qr) => (
          <div key={`qr-${qr._id}`} className="qr-card">
            <div className="qr-header">
              <h4>{qr.title}</h4>
              <div className="qr-status">
                <span className={`status-badge ${qr.isActive ? 'status-active' : 'status-inactive'}`}>
                  {qr.isActive ? '🟢 Active' : '⚫ Inactive'}
                </span>
              </div>
            </div>

            <div className="qr-image-container">
              <img
                src={qr.qrImageUrl}
                alt={`${qr.title} QR Code`}
                className="qr-image"
                onError={(e) => {
                  e.target.src = '/images/default-qr.png';
                }}
              />
            </div>

            <div className="qr-details">
              <p><strong>Event:</strong> {qr.eventName}</p>
              <p><strong>Amount:</strong> {qr.amount}</p>
              <p className="qr-description">{qr.description}</p>
            </div>

            <div className="qr-actions">
              <button
                className="action-btn edit"
                onClick={() => editQrCode(qr)}
              >
                ✏️ Edit
              </button>
              <button
                className={`action-btn ${qr.isActive ? 'deactivate' : 'activate'}`}
                onClick={() => toggleQrActive(qr._id, !qr.isActive)}
              >
                {qr.isActive ? '🔴 Deactivate' : '🟢 Activate'}
              </button>
              <button
                className="action-btn delete"
                onClick={() => deleteQrCode(qr._id)}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Get today's date for min date validation
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="upload-page">
      {/* Title at top left */}
      <h1 className="home-title">Annapurneshwari Temple</h1>

      {/* Admin Dashboard Container */}
      <div className="upload-container">
        <div className="upload-header">
          <h2 className="upload-title">Admin Dashboard</h2>
          <p className="upload-subtitle">Manage temple media and marriage hall bookings</p>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            📸 Media Upload
          </button>
          <button
            className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            💒 Hall Booking Management
          </button>
          <button
            className={`tab-button ${activeTab === 'qr' ? 'active' : ''}`}
            onClick={() => setActiveTab('qr')}
          >
            💰 QR Code Management
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="tab-content">
        {/* YouTube Authorization Notice */}
        {files.some(file => file.type.startsWith('video/')) && !youtubeAuthorized && (
          <div className="message" style={{
            background: '#fef3c7',
            color: '#92400e',
            border: '1px solid #f59e0b',
            marginBottom: '2rem'
          }}>
            <strong>🎥 Video Upload Notice:</strong> To upload videos, you need to authorize YouTube access first.
            <br />
            <button
              type="button"
              onClick={authorizeYouTube}
              disabled={authorizingYoutube}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                marginTop: '0.5rem',
                fontSize: '0.9rem'
              }}
            >
              {authorizingYoutube ? 'Authorizing...' : '🔗 Authorize YouTube'}
            </button>
          </div>
        )}

            <form className="upload-form" onSubmit={handleUploadSubmit}>
          <div className="form-group">
            <label htmlFor="eventName">Event Name *</label>
            <input
              id="eventName"
              name="eventName"
              type="text"
                  value={uploadData.eventName}
                  onChange={handleUploadChange}
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
                  value={uploadData.title}
                  onChange={handleUploadChange}
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
                  value={uploadData.eventDate}
                  onChange={handleUploadChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Media Type</label>
                <select id="type" name="type" value={uploadData.type} onChange={handleUploadChange}>
              <option value="image">Photos</option>
              <option value="video">Videos</option>
              <option value="mixed">Mixed (Photos & Videos)</option>
            </select>
            <small>Auto-detected from selected files (you can also select manually)</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
                  value={uploadData.description}
                  onChange={handleUploadChange}
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

              {uploadMessage && (
                <div className={`message ${uploadMessage.includes('✅') ? 'success' : 'error'}`}>
                  {uploadMessage}
            </div>
          )}

          <button type="submit" className="upload-button" disabled={uploading || files.length === 0}>
            {uploading
              ? `Uploading ${files.length} file(s)...`
              : `Upload ${files.length > 0 ? `${files.length} ` : ''}Media`}
          </button>
            </form>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="tab-content">
            <div className="bookings-section">
              {/* Calendar and Booking Form */}
              <div className="booking-section">
                {/* Availability Calendar */}
                <div className="calendar-section">
                  <h3>📅 Next Month's Availability</h3>

                  {/* Calendar Navigation - Outside Calendar Component */}
                  <BookingCalendarNavigation
                    selectedMonth={calendarSelectedMonth}
                    setSelectedMonth={setCalendarSelectedMonth}
                    currentMonth={new Date(new Date().getFullYear(), new Date().getMonth(), 1)}
                  />

                  {loadingBookedDates ? (
                    <div className="loading">
                      <p>Loading calendar...</p>
                    </div>
                  ) : (
                    <BookingCalendar
                      bookedDates={bookedDates}
                      selectedDate={selectedDate}
                      onDateSelect={(date) => {
                        setSelectedDate(date);
                        setBookingData(prev => ({ ...prev, eventDate: date }));
                      }}
                      loading={loadingBookedDates}
                    />
                  )}
                </div>

                {/* Weekly Events Section */}
                <div className="weekly-events-section">
                  <h3>📋 This Week's Events</h3>
                  {loadingWeeklyEvents ? (
                    <div className="loading"><p>Loading weekly events...</p></div>
                  ) : weeklyEvents.length === 0 ? (
                    <div className="no-events">
                      <p>🎉 No events scheduled for this week!</p>
                    </div>
                  ) : (
                    <div className="weekly-events-list">
                      {weeklyEvents.map((event) => (
                        <div key={event._id} className="weekly-event-item">
                          <div className="event-header">
                            <h4>{event.functionType.charAt(0).toUpperCase() + event.functionType.slice(1)}</h4>
                            <span className={`event-status ${event.status}`}>
                              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                            </span>
                          </div>
                          <div className="event-details">
                            <p><strong>Customer:</strong> {event.customerName}</p>
                            <p><strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString('en-IN', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}</p>
                            <p><strong>Guests:</strong> {event.guestCount}</p>
                            <p><strong>Contact:</strong> {event.mobileNumber}</p>
                            <p><strong>Reference:</strong> {event.bookingReference}</p>
                            <p className="event-address"><strong>Address:</strong> {event.address}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Create New Booking Form */}
                <div className="booking-form-section">
                  <h3>📝 Create New Booking</h3>
                  <form className="booking-form" onSubmit={handleBookingSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="customerName">Customer Name *</label>
                        <input
                          type="text"
                          id="customerName"
                          name="customerName"
                          value={bookingData.customerName}
                          onChange={handleBookingChange}
                          placeholder="Enter customer's full name"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="mobileNumber">Mobile Number *</label>
                        <input
                          type="tel"
                          id="mobileNumber"
                          name="mobileNumber"
                          value={bookingData.mobileNumber}
                          onChange={handleBookingChange}
                          placeholder="+91 98765 43210"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="eventDate">Event Date *</label>
                        <input
                          type="date"
                          id="eventDate"
                          name="eventDate"
                          value={bookingData.eventDate}
                          onChange={handleBookingChange}
                          min={today}
                          required
                        />
                        {bookingData.eventDate && (
                          <small className={bookedDates.includes(bookingData.eventDate) ? 'date-unavailable' : 'date-available'}>
                            {bookedDates.includes(bookingData.eventDate) ? '❌ Date not available' : '✅ Date available'}
                          </small>
                        )}
                      </div>
                      <div className="form-group">
                        <label htmlFor="functionType">Function Type *</label>
                        <select id="functionType" name="functionType" value={bookingData.functionType} onChange={handleBookingChange} required>
                          <option value="">Select function type</option>
                          <option value="wedding">Wedding</option>
                          <option value="engagement">Engagement</option>
                          <option value="reception">Reception</option>
                          <option value="birthday">Birthday Party</option>
                          <option value="corporate">Corporate Event</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="guestCount">Expected Guest Count *</label>
                        <select id="guestCount" name="guestCount" value={bookingData.guestCount} onChange={handleBookingChange} required>
                          <option value="">Select guest count</option>
                          <option value="50-100">50-100 guests</option>
                          <option value="100-200">100-200 guests</option>
                          <option value="200-300">200-300 guests</option>
                          <option value="300-500">300-500 guests</option>
                          <option value="500+">500+ guests</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="address">Address *</label>
                      <textarea
                        id="address"
                        name="address"
                        value={bookingData.address}
                        onChange={handleBookingChange}
                        rows="3"
                        placeholder="Complete address for invitation cards and communication"
                        required
                      ></textarea>
                    </div>

                    {bookingMessage && (
                      <div className={`message ${bookingMessage.includes('✅') ? 'success' : 'error'}`}>
                        {bookingMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="upload-button"
                      disabled={submittingBooking || (bookingData.eventDate && bookedDates.includes(bookingData.eventDate))}
                    >
                      {submittingBooking ? 'Creating Booking...' : 'Create Booking'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Bookings List */}
              <div className="bookings-list-section">
                <h3>📋 Recent Bookings</h3>
                {loadingBookings ? (
                  <div className="loading">Loading bookings...</div>
                ) : bookings.length === 0 ? (
                  <div className="empty-bookings">
                    <p>No bookings found. New bookings will appear here.</p>
                  </div>
                ) : (
                  <div className="bookings-grid">
                    {bookings.map((booking) => (
                      <div key={booking._id} className="booking-card">
                        <div className="booking-header">
                          <h4>{booking.functionType} - {booking.customerName}</h4>
                          <span className={`status-badge status-${booking.status}`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="booking-details">
                          <p><strong>Reference:</strong> {booking.bookingReference}</p>
                          <p><strong>Date:</strong> {new Date(booking.eventDate).toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</p>
                          <p><strong>Guests:</strong> {booking.guestCount}</p>
                          <p><strong>Contact:</strong> {booking.customerName} ({booking.mobileNumber})</p>
                          <p><strong>Address:</strong> {booking.address.substring(0, 50)}{booking.address.length > 50 ? '...' : ''}</p>
                        </div>
                        <div className="booking-actions">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                className="status-btn confirm"
                                onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                              >
                                ✅ Confirm
                              </button>
                              <button
                                className="status-btn cancel"
                                onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                              >
                                ❌ Cancel
                              </button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <>
                              <button
                                className="status-btn complete"
                                onClick={() => updateBookingStatus(booking._id, 'completed')}
                              >
                                ✓ Complete
                              </button>
                              <button
                                className="status-btn cancel"
                                onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                              >
                                ❌ Cancel Booking
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* QR Code Tab */}
        {activeTab === 'qr' && (
          <div className="tab-content">
            <div className="qr-section">
              {/* Create/Edit QR Code Form */}
              <div className="qr-form-section">
                <h3>{editingQr ? '✏️ Edit QR Code' : '➕ Create New QR Code'}</h3>
                <form className="qr-form" onSubmit={handleQrSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="qrTitle">Title *</label>
                      <input
                        type="text"
                        id="qrTitle"
                        name="title"
                        value={qrData.title}
                        onChange={handleQrChange}
                        placeholder="e.g., Temple Donation, Special Event"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="qrEventName">Event Name *</label>
                      <input
                        type="text"
                        id="qrEventName"
                        name="eventName"
                        value={qrData.eventName}
                        onChange={handleQrChange}
                        placeholder="e.g., Navaratri, Wedding Fund"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="qrAmount">Amount *</label>
                      <input
                        type="text"
                        id="qrAmount"
                        name="amount"
                        value={qrData.amount}
                        onChange={handleQrChange}
                        placeholder="e.g., Any Amount, ₹1000"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="qrCode">QR Code Text (Optional)</label>
                      <input
                        type="text"
                        id="qrCode"
                        name="qrCode"
                        value={qrData.qrCode}
                        onChange={handleQrChange}
                        placeholder="UPI ID or payment details"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="qrDescription">Description *</label>
                    <textarea
                      id="qrDescription"
                      name="description"
                      value={qrData.description}
                      onChange={handleQrChange}
                      rows="3"
                      placeholder="Detailed description of the donation purpose"
                      required
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label htmlFor="qrImage">QR Code Image {editingQr ? '(Optional)' : '*'}</label>
                    <input
                      type="file"
                      id="qrImage"
                      accept="image/*"
                      onChange={handleQrImageChange}
                      required={!editingQr}
                    />
                    <small>Upload the QR code image (JPG, PNG, etc.). {editingQr ? 'Leave empty to keep current image.' : ''}</small>
                    {qrImageFile && (
                      <div className="file-preview">
                        <strong>Selected:</strong> {qrImageFile.name}
                      </div>
                    )}
                  </div>

                  {qrMessage && (
                    <div className={`message ${qrMessage.includes('✅') ? 'success' : 'error'}`}>
                      {qrMessage}
                    </div>
                  )}

                  <div className="form-actions">
                    <button type="submit" className="upload-button" disabled={submittingQr}>
                      {submittingQr ? 'Saving...' : editingQr ? 'Update QR Code' : 'Create QR Code'}
                    </button>
                    {editingQr && (
                      <button
                        type="button"
                        className="cancel-button"
                        onClick={() => {
                          setEditingQr(null);
                          setQrData({
                            title: '',
                            description: '',
                            eventName: '',
                            amount: '',
                            qrCode: ''
                          });
                          setQrImageFile(null);
                        }}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* QR Codes List */}
              <div className="qr-list-section">
                <h3>📱 QR Code Gallery</h3>
                {qrGridContent}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'space-between' }}>
          <div>
            {activeTab === 'upload' && (
            <Link to="/gallery" className="view-gallery-link">
              View Gallery →
            </Link>
            )}
          </div>
            <button
              type="button"
            onClick={logout}
              className="logout-button"
            >
              Logout
            </button>
          </div>
      </div>

      {/* Fixed top navigation */}
      <nav className="top-nav">
        <div className="nav-links">
          <Link to="/about" className="nav-link">About Us</Link>
          <Link to="/gallery" className="nav-link">Gallery</Link>
          <Link to="/seva" className="nav-link">Seva</Link>
          <Link to="/contact" className="nav-link">Contact Us</Link>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/login');
            }}
            className="nav-link"
            style={{ background: 'none', border: 'none', color: '#f97316', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
}

export default AdminDashboard;
