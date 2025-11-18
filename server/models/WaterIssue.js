/**
 * Water Issue Model
 * Tracks water quality issues and incidents
 */

const mongoose = require('mongoose');

const waterIssueSchema = new mongoose.Schema({
  issueId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  issueType: {
    type: String,
    required: true,
    enum: [
      'contamination',
      'supply_shortage',
      'pressure_issues',
      'taste_odor',
      'color_appearance',
      'infrastructure',
      'billing',
      'other'
    ],
    index: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },
  location: {
    coordinates: {
      type: [Number], // [longitude, latitude]
      validate: {
        validator: function(v) {
          return v.length === 2;
        },
        message: 'Coordinates must have exactly 2 elements [longitude, latitude]'
      }
    },
    address: {
      type: String,
      required: true
    },
    county: {
      type: String,
      required: true,
      index: true
    },
    subcounty: {
      type: String,
      index: true
    },
    ward: {
      type: String,
      index: true
    }
  },
  reportedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String
    }
  },
  status: {
    type: String,
    enum: [
      'reported',
      'investigating',
      'in_progress',
      'resolved',
      'closed',
      'rejected'
    ],
    default: 'reported',
    index: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
waterIssueSchema.index({ createdAt: -1 });
waterIssueSchema.index({ status: 1 });
waterIssueSchema.index({ issueType: 1, severity: 1 });

// Pre-save middleware
waterIssueSchema.pre('save', function(next) {
  if (this.isNew && !this.issueId) {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.issueId = `WI-${year}-${random}`;
  }
  next();
});

module.exports = mongoose.models.WaterIssue || mongoose.model('WaterIssue', waterIssueSchema);