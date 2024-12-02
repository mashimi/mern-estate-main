import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import Booking from '../models/booking.model.js';
import Listing from '../models/listing.model.js';

const router = express.Router();

// Create a booking
router.post('/create', verifyToken, async (req, res, next) => {
  try {
    const { listingId, checkIn, checkOut, numberOfGuests, totalPrice } = req.body;
    
    // Check if the listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // Check if the number of guests is within the limit
    if (numberOfGuests > listing.maxGuests) {
      return res.status(400).json({ 
        success: false, 
        message: `Maximum ${listing.maxGuests} guests allowed` 
      });
    }

    // Check availability for each date
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    for (let date = new Date(checkInDate); date <= checkOutDate; date.setDate(date.getDate() + 1)) {
      const bookingDate = date.toISOString().split('T')[0];
      const existingBooking = listing.bookedDates.find(
        bd => bd.date.toISOString().split('T')[0] === bookingDate
      );
      
      if (existingBooking && (listing.totalSpots - existingBooking.spotsBooked) < 1) {
        return res.status(400).json({
          success: false,
          message: `No spots available for ${bookingDate}`
        });
      }
    }

    // Create the booking
    const newBooking = new Booking({
      listingId,
      userId: req.user.id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      numberOfGuests,
      totalPrice,
      status: 'confirmed'
    });

    // Update the listing's booked dates
    for (let date = new Date(checkInDate); date <= checkOutDate; date.setDate(date.getDate() + 1)) {
      const bookingDate = date.toISOString().split('T')[0];
      const existingDateIndex = listing.bookedDates.findIndex(
        bd => bd.date.toISOString().split('T')[0] === bookingDate
      );

      if (existingDateIndex >= 0) {
        listing.bookedDates[existingDateIndex].spotsBooked += 1;
      } else {
        listing.bookedDates.push({
          date: date,
          spotsBooked: 1
        });
      }
    }

    await listing.save();
    await newBooking.save();

    res.status(201).json({
      success: true,
      booking: newBooking
    });
  } catch (error) {
    next(error);
  }
});

// Get user's bookings
router.get('/user-bookings', verifyToken, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('listingId')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      bookings
    });
  } catch (error) {
    next(error);
  }
});

// Cancel booking
router.put('/cancel/:id', verifyToken, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Update the listing's booked dates
    const listing = await Listing.findById(booking.listingId);
    if (listing) {
      for (let date = new Date(booking.checkIn); date <= booking.checkOut; date.setDate(date.getDate() + 1)) {
        const bookingDate = date.toISOString().split('T')[0];
        const existingDateIndex = listing.bookedDates.findIndex(
          bd => bd.date.toISOString().split('T')[0] === bookingDate
        );

        if (existingDateIndex >= 0) {
          listing.bookedDates[existingDateIndex].spotsBooked -= 1;
          if (listing.bookedDates[existingDateIndex].spotsBooked <= 0) {
            listing.bookedDates.splice(existingDateIndex, 1);
          }
        }
      }
      await listing.save();
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    next(error);
  }
});

export default router;
