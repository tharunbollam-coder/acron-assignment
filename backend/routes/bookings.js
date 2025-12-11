const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Court = require('../models/Court');
const Equipment = require('../models/Equipment');
const Coach = require('../models/Coach');
const AvailabilityChecker = require('../utils/availabilityChecker');
const PriceCalculator = require('../utils/priceCalculator');

// GET all bookings
router.get('/', async (req, res) => {
  try {
    const { status, date, court } = req.query;
    let filter = {};
    
    if (status) filter.status = status;
    if (court) filter.court = court;
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      filter.startTime = { $gte: startOfDay, $lt: endOfDay };
    }
    
    const bookings = await Booking.find(filter)
      .populate('court')
      .populate('resources.equipment.equipment')
      .populate('resources.coach')
      .sort({ startTime: 1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single booking
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('court')
      .populate('resources.equipment.equipment')
      .populate('resources.coach');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new booking
router.post('/', async (req, res) => {
  try {
    const {
      user,
      courtId,
      startTime,
      endTime,
      equipmentRequests = [],
      coachId
    } = req.body;

    // Validate required fields
    if (!user || !courtId || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if court exists
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }

    // Get equipment details
    const equipmentDetails = [];
    for (const request of equipmentRequests) {
      const equipment = await Equipment.findById(request.equipment);
      if (!equipment) {
        return res.status(404).json({ message: `Equipment not found: ${request.equipment}` });
      }
      equipmentDetails.push({
        equipment: equipment,
        quantity: request.quantity
      });
    }

    // Get coach details if provided
    let coach = null;
    if (coachId) {
      coach = await Coach.findById(coachId);
      if (!coach) {
        return res.status(404).json({ message: 'Coach not found' });
      }
    }

    // Check availability
    const availability = await AvailabilityChecker.checkAvailability(
      courtId,
      new Date(startTime),
      new Date(endTime),
      equipmentRequests,
      coachId
    );

    if (!availability.allAvailable) {
      return res.status(409).json({
        message: 'Requested resources are not available',
        availability
      });
    }

    // Calculate price
    const pricingBreakdown = await PriceCalculator.calculateTotal(
      court,
      new Date(startTime),
      new Date(endTime),
      equipmentDetails,
      coach
    );

    // Create booking
    const booking = new Booking({
      user,
      court: courtId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      resources: {
        equipment: equipmentRequests,
        coach: coachId
      },
      pricingBreakdown
    });

    const savedBooking = await booking.save();

    // Update equipment available stock
    for (const request of equipmentRequests) {
      await Equipment.findByIdAndUpdate(
        request.equipment,
        { $inc: { availableStock: -request.quantity } }
      );
    }

    // Return populated booking
    const populatedBooking = await Booking.findById(savedBooking._id)
      .populate('court')
      .populate('resources.equipment.equipment')
      .populate('resources.coach');

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(400).json({ message: error.message });
  }
});

// PUT update booking
router.put('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('court')
      .populate('resources.equipment.equipment')
      .populate('resources.coach');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE booking (cancel)
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update equipment stock back
    for (const item of booking.resources.equipment) {
      await Equipment.findByIdAndUpdate(
        item.equipment,
        { $inc: { availableStock: item.quantity } }
      );
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check availability for potential booking
router.post('/check-availability', async (req, res) => {
  try {
    const { courtId, startTime, endTime, equipmentRequests = [], coachId } = req.body;

    const availability = await AvailabilityChecker.checkAvailability(
      courtId,
      new Date(startTime),
      new Date(endTime),
      equipmentRequests,
      coachId
    );

    res.json(availability);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get available time slots for a court on a specific date
router.get('/slots/:courtId/:date', async (req, res) => {
  try {
    const { courtId, date } = req.params;
    
    const slots = await AvailabilityChecker.getAvailableSlots(courtId, date);
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Calculate price for potential booking
router.post('/calculate-price', async (req, res) => {
  try {
    const { courtId, startTime, endTime, equipmentRequests = [], coachId } = req.body;

    // Get court details
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }

    // Get equipment details
    const equipmentDetails = [];
    for (const request of equipmentRequests) {
      const equipment = await Equipment.findById(request.equipment);
      if (!equipment) {
        return res.status(404).json({ message: `Equipment not found: ${request.equipment}` });
      }
      equipmentDetails.push({
        equipment: equipment,
        quantity: request.quantity
      });
    }

    // Get coach details if provided
    let coach = null;
    if (coachId) {
      coach = await Coach.findById(coachId);
      if (!coach) {
        return res.status(404).json({ message: 'Coach not found' });
      }
    }

    // Calculate price
    const pricingBreakdown = await PriceCalculator.calculateTotal(
      court,
      new Date(startTime),
      new Date(endTime),
      equipmentDetails,
      coach
    );

    res.json(pricingBreakdown);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
