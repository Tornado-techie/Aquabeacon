const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['purification', 'bottling', 'both'],
    required: true
  },
  location: {
    address: String,
    county: String,
    subCounty: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  capacity: {
    dailyProduction: Number, // liters per day
    storageCapacity: Number // liters
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'pending'
  },
  permits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permit'
  }],
  labSamples: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabSample'
  }],
  complaints: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint'
  }],
  contact: {
    phone: String,
    email: String,
    manager: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Plant || mongoose.model('Plant', plantSchema);
