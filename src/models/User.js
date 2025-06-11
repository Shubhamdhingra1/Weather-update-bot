const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true,
    index: true, // Faster queries
  },
  username: {
    type: String,
    default: '',
    trim: true
  },
  firstName: {
    type: String,
    default: '',
    trim: true
  },
  lastName: {
    type: String,
    default: '',
    trim: true
  },
  isSubscribed: {
    type: Boolean,
    default: false
  },
  location: {
    latitude: {
      type: Number,
      default: null,
      validate: {
        validator: val => val === null || (val >= -90 && val <= 90),
        message: 'Latitude must be between -90 and 90'
      }
    },
    longitude: {
      type: Number,
      default: null,
      validate: {
        validator: val => val === null || (val >= -180 && val <= 180),
        message: 'Longitude must be between -180 and 180'
      }
    }
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Adds updatedAt field automatically
});

module.exports = mongoose.model('User', userSchema);
