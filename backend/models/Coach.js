const mongoose = require('mongoose');

const CoachSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Coach name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  specializations: [{
    type: String,
    enum: ['badminton', 'tennis', 'basketball', 'volleyball'],
    required: true
  }],
  hourlyRate: {
    type: Number,
    required: [true, 'Hourly rate is required'],
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  bio: {
    type: String,
    trim: true
  },
  certifications: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Coach', CoachSchema);
