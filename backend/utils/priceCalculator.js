const PricingRule = require('../models/PricingRule');

class PriceCalculator {
  static async calculateTotal(court, startTime, endTime, equipment = [], coach = null) {
    let basePrice = court.basePrice;
    let pricingBreakdown = {
      basePrice,
      peakHourFee: 0,
      weekendFee: 0,
      equipmentFee: 0,
      coachFee: 0,
      total: basePrice
    };

    // Get applicable pricing rules
    const rules = await PricingRule.find({ isActive: true }).sort({ priority: 1 });
    
    // Apply time-based rules
    const bookingDate = new Date(startTime);
    const dayOfWeek = bookingDate.getDay(); // 0 = Sunday, 6 = Saturday
    const bookingHour = bookingDate.getHours();

    for (const rule of rules) {
      switch (rule.type) {
        case 'peak_hour':
          if (this.isPeakHour(bookingHour, rule.startTime, rule.endTime)) {
            if (rule.multiplier > 1) {
              pricingBreakdown.peakHourFee = basePrice * (rule.multiplier - 1);
              pricingBreakdown.total += pricingBreakdown.peakHourFee;
            } else if (rule.surcharge > 0) {
              pricingBreakdown.peakHourFee = rule.surcharge;
              pricingBreakdown.total += pricingBreakdown.peakHourFee;
            }
          }
          break;
          
        case 'weekend':
          if (rule.daysOfWeek.includes(dayOfWeek)) {
            if (rule.multiplier > 1) {
              pricingBreakdown.weekendFee = basePrice * (rule.multiplier - 1);
              pricingBreakdown.total += pricingBreakdown.weekendFee;
            } else if (rule.surcharge > 0) {
              pricingBreakdown.weekendFee = rule.surcharge;
              pricingBreakdown.total += pricingBreakdown.weekendFee;
            }
          }
          break;
          
        case 'court_type':
          if (rule.applicableCourtTypes.includes(court.type)) {
            if (rule.multiplier > 1) {
              const courtTypeFee = basePrice * (rule.multiplier - 1);
              pricingBreakdown.total += courtTypeFee;
            } else if (rule.surcharge > 0) {
              pricingBreakdown.total += rule.surcharge;
            }
          }
          break;
      }
    }

    // Add equipment fees
    for (const item of equipment) {
      pricingBreakdown.equipmentFee += item.equipment.rentalPrice * item.quantity;
    }
    pricingBreakdown.total += pricingBreakdown.equipmentFee;

    // Add coach fee
    if (coach) {
      pricingBreakdown.coachFee = coach.hourlyRate;
      pricingBreakdown.total += pricingBreakdown.coachFee;
    }

    return pricingBreakdown;
  }

  static isPeakHour(currentHour, startTime, endTime) {
    if (!startTime || !endTime) return false;
    
    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);
    
    return currentHour >= start && currentHour < end;
  }

  static async getAvailableTimeSlots(courtId, date) {
    const Booking = require('../models/Booking');
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Get existing bookings for the day
    const bookings = await Booking.find({
      court: courtId,
      startTime: { $gte: startOfDay, $lt: endOfDay },
      status: 'confirmed'
    }).sort({ startTime: 1 });

    // Generate hourly slots from 6 AM to 10 PM
    const slots = [];
    for (let hour = 6; hour < 22; hour++) {
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0);
      
      const slotEnd = new Date(date);
      slotEnd.setHours(hour + 1, 0, 0, 0);
      
      // Check if slot is available
      const isAvailable = !bookings.some(booking => 
        (booking.startTime < slotEnd && booking.endTime > slotStart)
      );
      
      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        isAvailable,
        timeString: `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`
      });
    }
    
    return slots;
  }
}

module.exports = PriceCalculator;
