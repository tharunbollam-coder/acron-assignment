const mongoose = require('mongoose');

const PricingRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Rule name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['peak_hour', 'weekend', 'holiday', 'seasonal', 'court_type'],
    required: [true, 'Rule type is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // For time-based rules (peak_hour)
  startTime: {
    type: String, // HH:mm format
    validate: {
      validator: function(v) {
        return !this.startTime || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Start time must be in HH:mm format'
    }
  },
  endTime: {
    type: String, // HH:mm format
    validate: {
      validator: function(v) {
        return !this.endTime || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'End time must be in HH:mm format'
    }
  },
  // For day-based rules (weekend, holiday)
  daysOfWeek: [{
    type: Number, // 0 = Sunday, 6 = Saturday
    min: 0,
    max: 6
  }],
  // For court type rules
  applicableCourtTypes: [{
    type: String,
    enum: ['indoor', 'outdoor']
  }],
  // Pricing modification
  multiplier: {
    type: Number,
    min: 0,
    default: 1.0
  },
  surcharge: {
    type: Number,
    min: 0,
    default: 0
  },
  priority: {
    type: Number,
    default: 1,
    min: 1
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PricingRule', PricingRuleSchema);
