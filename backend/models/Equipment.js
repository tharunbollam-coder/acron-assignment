const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Equipment name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['racket', 'shoes', 'ball', 'net', 'other'],
    required: [true, 'Equipment type is required']
  },
  sport: {
    type: String,
    enum: ['badminton', 'tennis', 'basketball', 'volleyball', 'general'],
    required: [true, 'Sport type is required']
  },
  totalStock: {
    type: Number,
    required: [true, 'Total stock is required'],
    min: 0
  },
  availableStock: {
    type: Number,
    required: [true, 'Available stock is required'],
    min: 0
  },
  rentalPrice: {
    type: Number,
    required: [true, 'Rental price is required'],
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Equipment', EquipmentSchema);
