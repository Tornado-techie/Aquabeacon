const mongoose = require('mongoose');

const labSampleSchema = new mongoose.Schema({
  plant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant',
    required: true
  },
  sampleId: {
    type: String,
    unique: true,
    required: true
  },
  sampleType: {
    type: String,
    enum: ['routine', 'complaint', 'pre-production', 'post-incident', 'regulatory'],
    default: 'routine'
  },
  batchCode: String,
  collectionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  laboratory: {
    name: {
      type: String,
      required: true
    },
    accreditation: String,
    contact: String
  },
  tests: [{
    parameter: {
      type: String,
      required: true
    },
    result: {
      type: String,
      required: true
    },
    unit: String,
    limit: String,
    status: {
      type: String,
      enum: ['compliant', 'non-compliant', 'pending'],
      default: 'pending'
    },
    method: String
  }],
  overallStatus: {
    type: String,
    enum: ['pending', 'compliant', 'non-compliant'],
    default: 'pending'
  },
  reportDate: Date,
  reportUrl: String,
  s3Key: String,
  relatedComplaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint'
  },
  cost: {
    amount: Number,
    currency: {
      type: String,
      default: 'KES'
    },
    paid: Boolean
  },
  notes: String,
  retentionDate: {
    type: Date,
    default: function() {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 3);
      return date;
    }
  }
}, {
  timestamps: true
});

labSampleSchema.index({ plant: 1 });
labSampleSchema.index({ sampleType: 1 });
labSampleSchema.index({ collectionDate: -1 });
labSampleSchema.index({ overallStatus: 1 });

module.exports = mongoose.models.LabSample || mongoose.model('LabSample', labSampleSchema);