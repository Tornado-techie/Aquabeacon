const mongoose = require('mongoose');

const standardSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    required: true,
    enum: [
      'bottled_water',
      'packaging',
      'labeling',
      'quality',
      'hygiene',
      'equipment',
      'general'
    ]
  },
  issuingBody: {
    type: String,
    default: 'KEBS'
  },
  publicationDate: Date,
  effectiveDate: Date,
  revisionDate: Date,
  status: {
    type: String,
    enum: ['current', 'superseded', 'withdrawn'],
    default: 'current'
  },
  requirements: [{
    section: String,
    requirement: String,
    specification: String,
    testMethod: String
  }],
  documentUrl: String,
  s3Key: String,
  relatedStandards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Standard'
  }],
  supersedes: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Standard'
  },
  tags: [String]
}, {
  timestamps: true
});

standardSchema.index({ code: 1 });
standardSchema.index({ category: 1 });
standardSchema.index({ status: 1 });

module.exports = mongoose.models.Standard || mongoose.model('Standard', standardSchema);