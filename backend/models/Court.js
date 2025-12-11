const mongoose = require('mongoose');

const CourtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Court name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['indoor', 'outdoor'],
    required: [true, 'Court type is required']
  },
  sport: {
    type: String,
    enum: ['badminton', 'tennis', 'basketball', 'volleyball'],
    required: [true, 'Sport type is required']
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true
  },
  amenities: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Court', CourtSchema);
