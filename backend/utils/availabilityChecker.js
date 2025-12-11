const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');
const Coach = require('../models/Coach');

class AvailabilityChecker {
  static async checkAvailability(courtId, startTime, endTime, equipmentRequests = [], coachId = null) {
    const results = {
      court: false,
      equipment: [],
      coach: false,
      allAvailable: false
    };

    // Check court availability
    results.court = await this.checkCourtAvailability(courtId, startTime, endTime);

    // Check equipment availability
    results.equipment = await this.checkEquipmentAvailability(equipmentRequests, startTime, endTime);

    // Check coach availability if requested
    if (coachId) {
      results.coach = await this.checkCoachAvailability(coachId, startTime, endTime);
    } else {
      results.coach = true; // No coach requested, so available by default
    }

    // Check if all requested resources are available
    results.allAvailable = results.court && 
      results.equipment.every(item => item.available) && 
      results.coach;

    return results;
  }

  static async checkCourtAvailability(courtId, startTime, endTime) {
    const conflictingBooking = await Booking.findOne({
      court: courtId,
      status: 'confirmed',
      $or: [
        // New booking starts during an existing booking
        { startTime: { $lt: endTime, $gte: startTime } },
        // New booking ends during an existing booking
        { endTime: { $gt: startTime, $lte: endTime } },
        // New booking completely contains an existing booking
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
        // Existing booking completely contains the new booking
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    });

    return !conflictingBooking;
  }

  static async checkEquipmentAvailability(equipmentRequests, startTime, endTime) {
    const results = [];

    for (const request of equipmentRequests) {
      const equipment = await Equipment.findById(request.equipment);
      if (!equipment) {
        results.push({
          equipmentId: request.equipment,
          requested: request.quantity,
          available: 0,
          available: false,
          message: 'Equipment not found'
        });
        continue;
      }

      // Get current bookings that use this equipment during the requested time
      const conflictingBookings = await Booking.find({
        'resources.equipment.equipment': request.equipment,
        status: 'confirmed',
        $or: [
          { startTime: { $lt: endTime, $gte: startTime } },
          { endTime: { $gt: startTime, $lte: endTime } },
          { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
          { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
        ]
      });

      // Calculate total equipment usage during this time
      let totalUsage = 0;
      for (const booking of conflictingBookings) {
        const equipmentInBooking = booking.resources.equipment.find(
          eq => eq.equipment.toString() === request.equipment.toString()
        );
        if (equipmentInBooking) {
          totalUsage += equipmentInBooking.quantity;
        }
      }

      const available = equipment.availableStock - totalUsage >= request.quantity;

      results.push({
        equipmentId: request.equipment,
        equipmentName: equipment.name,
        requested: request.quantity,
        availableStock: equipment.availableStock - totalUsage,
        available: available,
        message: available ? 'Available' : `Only ${equipment.availableStock - totalUsage} available`
      });
    }

    return results;
  }

  static async checkCoachAvailability(coachId, startTime, endTime) {
    const conflictingBooking = await Booking.findOne({
      'resources.coach': coachId,
      status: 'confirmed',
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    });

    return !conflictingBooking;
  }

  static async getAvailableSlots(courtId, date) {
    const PriceCalculator = require('./priceCalculator');
    
    const slots = await PriceCalculator.getAvailableTimeSlots(courtId, date);
    
    // For each slot, check coach availability if needed
    // This could be enhanced to show which coaches are available for each slot
    
    return slots;
  }
}

module.exports = AvailabilityChecker;
