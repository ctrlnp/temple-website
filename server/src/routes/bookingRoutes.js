const express = require('express');
const Booking = require('../models/Booking');
const { sendSMS } = require('../config/sms');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Create new booking
router.post('/', authenticate, async (req, res) => {
  try {
    console.log('📝 Booking creation request received');
    console.log('📝 Request body:', req.body);
    console.log('👤 User:', req.user?.email || 'No user');

    const bookingData = req.body;

    // Check if date is already booked
    console.log('📅 Checking date availability for:', bookingData.eventDate);
    const queryDate = new Date(bookingData.eventDate);
    console.log('📅 Parsed date:', queryDate);

    const existingBooking = await Booking.findOne({
      eventDate: queryDate,
      status: { $in: ['pending', 'confirmed'] }
    });

    console.log('📅 Existing booking found:', !!existingBooking);

    if (existingBooking) {
      return res.status(400).json({
        message: 'Selected date is already booked. Please choose another date.'
      });
    }

    // Create booking
    console.log('💾 Creating booking with data:', bookingData);
    let booking;
    try {
      booking = await Booking.create(bookingData);
      console.log('✅ Booking created successfully:', booking._id);
    } catch (validationError) {
      console.error('❌ Booking validation error:', validationError);
      throw validationError;
    }

    // Format SMS message for admin
    const smsMessage = `New Hall Booking Alert!
Ref: ${booking.bookingReference}
Customer: ${booking.customerName}
Event: ${booking.functionType}
Date: ${new Date(booking.eventDate).toLocaleDateString()}
Guests: ${booking.guestCount}
Contact: ${booking.mobileNumber}
Address: ${booking.address.substring(0, 50)}...`;

    // Send SMS to admin (replace with actual admin phone number)
    const adminPhoneNumber = process.env.ADMIN_PHONE || '+919876543210'; // Configure in environment variables
    const smsResult = await sendSMS(adminPhoneNumber, smsMessage);

    // Update booking with SMS status
    booking.smsSent = smsResult.success;
    await booking.save();

    res.status(201).json({
      message: 'Booking created successfully',
      booking: {
        id: booking._id,
        bookingReference: booking.bookingReference,
        status: booking.status,
        smsSent: booking.smsSent
      }
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // Return more specific error messages
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors: messages
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Booking reference already exists. Please try again.'
      });
    }

    res.status(500).json({
      message: 'Failed to create booking',
      error: error.message
    });
  }
});

// Get weekly events
router.get('/weekly', authenticate, async (req, res) => {
  try {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
    endOfWeek.setHours(23, 59, 59, 999);

    const weeklyBookings = await Booking.find({
      eventDate: {
        $gte: startOfWeek,
        $lte: endOfWeek
      },
      status: { $nin: ['cancelled'] } // Exclude cancelled bookings
    })
    .sort({ eventDate: 1 })
    .select('customerName mobileNumber eventDate functionType guestCount address bookingReference status');

    res.json(weeklyBookings);
  } catch (error) {
    console.error('Error fetching weekly events:', error);
    res.status(500).json({ message: 'Failed to fetch weekly events' });
  }
});

// Get booked dates for calendar (only confirmed bookings should block dates)
router.get('/booked-dates', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find({
      status: 'confirmed' // Only confirmed bookings should block dates
    }).select('eventDate');

    console.log('📅 Found CONFIRMED bookings for booked dates:', bookings.map(b => ({
      id: b._id,
      date: b.eventDate,
      iso: b.eventDate.toISOString()
    })));

    const bookedDates = bookings.map(booking =>
      booking.eventDate.toISOString().split('T')[0]
    );

    console.log('📅 Returning booked dates (confirmed only):', bookedDates);
    res.json(bookedDates);
  } catch (error) {
    console.error('Error fetching booked dates:', error);
    res.status(500).json({ message: 'Failed to fetch booked dates' });
  }
});

// Get all bookings (admin only - you might want to add authentication)
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// Get booking by reference number
router.get('/:reference', async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingReference: req.params.reference });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Failed to fetch booking' });
  }
});

// Update booking status (admin only)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Send status update SMS to customer if confirmed
    if (status === 'confirmed') {
      const customerSMS = `Booking Confirmed!
Ref: ${booking.bookingReference}
Event: ${booking.functionType}
Date: ${new Date(booking.eventDate).toLocaleDateString()}
Time: ${booking.eventTime}
Venue: Annapurneshwari Temple Marriage Hall
Contact: +919876543210`;

      await sendSMS(booking.contactPhone, customerSMS);
    }

    res.json({
      message: 'Booking status updated successfully',
      booking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Failed to update booking status' });
  }
});

// Check date availability
router.get('/check-availability', authenticate, async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date parameter is required' });
    }

    const existingBooking = await Booking.findOne({
      eventDate: new Date(date),
      status: { $in: ['pending', 'confirmed'] }
    });

    res.json({
      available: !existingBooking,
      date: date
    });
  } catch (error) {
    console.error('Error checking date availability:', error);
    res.status(500).json({ message: 'Failed to check date availability' });
  }
});

module.exports = router;
