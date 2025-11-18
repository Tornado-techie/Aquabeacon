// models/Inspection.js
// CREATE THIS FILE

const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema({
  waterIssue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WaterIssue',
    required: true
  },
  inspector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inspectionDate: {
    type: Date,
    default: Date.now
  },
  scheduledDate: Date,
  completedDate: Date,
  findings: {
    type: String,
    required: true
  },
  recommendations: {
    type: String
  },
  waterQualityParameters: {
    ph: {
      value: Number,
      status: {
        type: String,
        enum: ['acceptable', 'borderline', 'unacceptable']
      },
      notes: String
    },
    turbidity: {
      value: Number,
      unit: String,
      status: String,
      notes: String
    },
    chlorine: {
      value: Number,
      unit: String,
      status: String,
      notes: String
    },
    tds: {
      value: Number,
      unit: String,
      status: String,
      notes: String
    },
    temperature: {
      value: Number,
      unit: String
    },
    bacteria: {
      ecoli: {
        value: Number,
        unit: String,
        status: String
      },
      totalColiforms: {
        value: Number,
        unit: String,
        status: String
      }
    },
    heavyMetals: [{
      name: String,
      value: Number,
      unit: String,
      status: String
    }]
  },
  overallAssessment: {
    type: String,
    enum: ['safe', 'caution', 'unsafe', 'critical'],
    required: true
  },
  photos: [{
    filename: String,
    path: String,
    url: String,
    description: String,
    takenAt: {
      type: Date,
      default: Date.now
    }
  }],
  samples: [{
    sampleId: String,
    collectedAt: Date,
    sentToLab: String,
    labResults: {
      received: Boolean,
      date: Date,
      results: mongoose.Schema.Types.Mixed
    }
  }],
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  actionsTaken: [{
    action: String,
    takenBy: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  reportSubmitted: {
    type: Boolean,
    default: false
  },
  reportUrl: String,
  signature: {
    inspectorName: String,
    date: Date,
    digitalSignature: String
  }
}, {
  timestamps: true
});

// Indexes
inspectionSchema.index({ waterIssue: 1 });
inspectionSchema.index({ inspector: 1 });
inspectionSchema.index({ status: 1 });
inspectionSchema.index({ priority: 1 });
inspectionSchema.index({ inspectionDate: -1 });

module.exports = mongoose.models.Inspection || mongoose.model('Inspection', inspectionSchema);
