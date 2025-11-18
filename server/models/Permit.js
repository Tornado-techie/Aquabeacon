const mongoose = require('mongoose');

const permitSchema = new mongoose.Schema({
  plant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant',
    required: true
  },
  type: {
    type: String,
    enum: ['operation', 'construction', 'environmental', 'health'],
    required: true
  },
  permitNumber: {
    type: String,
    unique: true,
    required: true
  },
  issueDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked', 'pending'],
    default: 'pending'
  },
  documents: [{
    filename: String,
    originalName: String,
    url: String,
    uploadedAt: Date
  }],
  requirements: [{
    standard: String,
    met: Boolean,
    notes: String
  }],
  inspectorNotes: String,
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for efficient expiry queries
permitSchema.index({ expiryDate: 1 });
permitSchema.index({ plant: 1, status: 1 });

module.exports = mongoose.models.Permit || mongoose.model('Permit', permitSchema);
