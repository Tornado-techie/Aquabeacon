const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complainant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant'
  },
  type: {
    type: String,
    enum: ['quality', 'safety', 'labeling', 'hygiene', 'other'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  batchCode: String,
  productCode: String, // SM/ISM/DM codes
  location: {
    address: String,
    county: String,
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  photos: [{
    filename: String,
    originalName: String,
    url: String
  }],
  labResults: {
    sampleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabSample'
    },
    parameters: Map,
    conclusion: String
  },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'resolved', 'escalated'],
    default: 'submitted'
  },
  kebsEscalation: {
    escalatedAt: Date,
    escalationId: String,
    emailSent: Boolean,
    response: String,
    pdfUrl: String
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// TTL index for data retention (3 years)
complaintSchema.index({ createdAt: 1 }, { 
  expireAfterSeconds: 3 * 365 * 24 * 60 * 60 // 3 years
});

module.exports = mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);
