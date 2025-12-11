const express = require('express');
const router = express.Router();

// Admin dashboard data aggregation
router.get('/dashboard', async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const Court = require('../models/Court');
    const Coach = require('../models/Coach');
    const Equipment = require('../models/Equipment');

    // Get basic counts
    const totalCourts = await Court.countDocuments();
    const activeCourts = await Court.countDocuments({ isActive: true });
    const totalCoaches = await Coach.countDocuments({ isActive: true });
    const totalEquipment = await Equipment.countDocuments({ isActive: true });

    // Get booking statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = await Booking.countDocuments({
      startTime: { $gte: today, $lt: tomorrow },
      status: 'confirmed'
    });

    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    // Get recent bookings
    const recentBookings = await Booking.find()
      .populate('court')
      .populate('resources.coach')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get today's revenue
    const todayRevenue = await Booking.aggregate([
      {
        $match: {
          startTime: { $gte: today, $lt: tomorrow },
          status: 'confirmed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$pricingBreakdown.total' }
        }
      }
    ]);

    // Get monthly revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          startTime: { $gte: thirtyDaysAgo },
          status: 'confirmed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$pricingBreakdown.total' }
        }
      }
    ]);

    res.json({
      summary: {
        totalCourts,
        activeCourts,
        totalCoaches,
        totalEquipment,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        todayBookings
      },
      revenue: {
        today: todayRevenue.length > 0 ? todayRevenue[0].total : 0,
        monthly: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0
      },
      recentBookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk operations for admin
router.post('/bulk/courts', async (req, res) => {
  try {
    const Court = require('../models/Court');
    const courts = await Court.insertMany(req.body);
    res.status(201).json(courts);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/bulk/equipment', async (req, res) => {
  try {
    const Equipment = require('../models/Equipment');
    const equipment = await Equipment.insertMany(req.body);
    res.status(201).json(equipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// System health check
router.get('/health', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Get collection counts
    const Booking = require('../models/Booking');
    const Court = require('../models/Court');
    const Coach = require('../models/Coach');
    const Equipment = require('../models/Equipment');
    const PricingRule = require('../models/PricingRule');

    const counts = {
      bookings: await Booking.countDocuments(),
      courts: await Court.countDocuments(),
      coaches: await Coach.countDocuments(),
      equipment: await Equipment.countDocuments(),
      pricingRules: await PricingRule.countDocuments()
    };

    res.json({
      status: 'healthy',
      database: dbStatus,
      timestamp: new Date(),
      counts
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      message: error.message
    });
  }
});

module.exports = router;
