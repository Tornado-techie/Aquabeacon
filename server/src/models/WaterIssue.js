// models/WaterIssue.js
// CREATE THIS FILE

const mongoose = require('mongoose');

const waterIssueSchema = new mongoose.Schema({
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  issueType: {
    type: String,
    enum: [
      'contamination',
      'shortage',
      'infrastructure',
      'quality',
      'illegal_connection',
      'leakage',
      'pressure',
      'other'
    ],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    address: String,
    county: String,
    subCounty: String,
    town: String,
    landmark: String
  },
  photos: [{
    filename: String,
    path: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  waterParameters: {
    ph: Number,
    turbidity: Number,
    chlorine: Number,
    tds: Number, // Total Dissolved Solids
    temperature: Number,
    color: String,
    odor: String,
    taste: String
  },
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved', 'closed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  affectedPeople: {
    type: Number,
    default: 0
  },
  resolvedAt: Date,
  isPublic: {
    type: Boolean,
    default: true
  },
  notes: [{
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for geospatial queries
waterIssueSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
waterIssueSchema.index({ status: 1 });
waterIssueSchema.index({ reportedBy: 1 });
waterIssueSchema.index({ assignedTo: 1 });

module.exports = mongoose.models.WaterIssue || mongoose.model('WaterIssue', waterIssueSchema);