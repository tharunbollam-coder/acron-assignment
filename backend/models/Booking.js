const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'User email is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'User phone is required'],
      trim: true
    }
  },
  court: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Court',
    required: [true, 'Court is required']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  resources: {
    equipment: [{
      equipment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Equipment',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      }
    }],
    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coach',
      required: false
    }
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'waitlist'],
    default: 'confirmed'
  },
  pricingBreakdown: {
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    peakHourFee: {
      type: Number,
      default: 0,
      min: 0
    },
    weekendFee: {
      type: Number,
      default: 0,
      min: 0
    },
    equipmentFee: {
      type: Number,
      default: 0,
      min: 0
    },
    coachFee: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient availability checking
BookingSchema.index({ court: 1, startTime: 1, endTime: 1, status: 1 });
BookingSchema.index({ 'resources.coach': 1, startTime: 1, endTime: 1, status: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
