// models/Business.js
// CREATE THIS FILE

const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  registrationNumber: {
    type: String,
    trim: true,
    sparse: true
  },
  businessType: {
    type: String,
    enum: [
      'water_supply',
      'water_testing',
      'water_treatment',
      'water_distribution',
      'water_purification',
      'bottled_water',
      'water_equipment',
      'consulting'
    ],
    required: true
  },
  description: {
    type: String
  },
  location: {
    county: String,
    subCounty: String,
    town: String,
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  contact: {
    phone: String,
    email: String,
    website: String,
    alternativePhone: String
  },
  licenses: [{
    type: {
      type: String,
      enum: ['WASREB', 'WRA', 'NEMA', 'County', 'Other']
    },
    number: String,
    issuedBy: String,
    issueDate: Date,
    expiryDate: Date,
    document: String // URL to document
  }],
  employees: {
    type: Number,
    default: 0
  },
  servingArea: {
    counties: [String],
    towns: [String],
    estimatedPopulation: Number
  },
  waterSources: [{
    sourceType: {
      type: String,
      enum: ['borehole', 'river', 'lake', 'spring', 'municipal', 'rainwater', 'other']
    },
    location: String,
    capacity: Number, // in liters per day
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active'
    }
  }],
  facilities: [{
    type: {
      type: String,
      enum: ['treatment_plant', 'storage_tank', 'distribution_center', 'testing_lab', 'office']
    },
    location: String,
    capacity: Number,
    status: String
  }],
  status: {
    type: String,
    enum: ['pending', 'verified', 'suspended', 'inactive'],
    default: 'pending'
  },
  verifiedAt: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  logo: String,
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  subscriptionTier: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise'],
    default: 'free'
  }
}, {
  timestamps: true
});

// Indexes
businessSchema.index({ owner: 1 });
businessSchema.index({ status: 1 });
businessSchema.index({ businessType: 1 });
businessSchema.index({ registrationNumber: 1 }, { sparse: true });

module.exports = mongoose.models.Business || mongoose.model('Business', businessSchema);