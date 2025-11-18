const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  // Complaint tracking ID (human-readable)
  complaintId: {
    type: String,
    unique: true,
    index: true
  },
  
  // Reporter information
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Can be null for anonymous complaints
  },
  reporterName: {
    type: String,
    required: function() {
      return !this.isAnonymous;
    }
  },
  reporterEmail: {
    type: String
    // Removed match regex to allow empty string if optional
  },
  reporterPhone: {
    type: String,
    required: function() {
      return !this.isAnonymous;
    }
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  
  // Complaint details
  plant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant',
    default: null
  },
  plantName: String, // If plant not found in system
  
  // Product information
  batchCode: {
    type: String,
    trim: true
  },
  productCode: {
    type: String, // SM/ISM/DM code
    trim: true
  },
  productName: String,
  purchaseDate: Date,
  purchaseLocation: String,
  
  // Complaint category
  category: {
    type: String,
    required: true,
    enum: [
      'contamination',
      'foreign_object',
      'bad_taste',
      'bad_smell',
      'packaging_damage',
      'health_issue',
      'false_labeling',
      'expired_product',
      'other'
    ]
  },
  
  // Description
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [20, 'Description must be at least 20 characters']
  },
  
  // Date when complaint was reported
  reportedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  // Health impact
  healthImpact: {
    hasHealthImpact: {
      type: Boolean,
      default: false
    },
    symptoms: [String],
    medicalAttention: {
      type: Boolean,
      default: false
    },
    hospitalName: String
  },
  
  // Location where issue occurred
  incidentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number], // [longitude, latitude]
    address: String
  },
  
  // Photos and evidence
  photos: [{
    url: String,
    s3Key: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Lab test results (if any)
  labSample: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabSample',
    default: null
  },
  
  // Status tracking
  status: {
    type: String,
    enum: [
      'received',
      'under_review',
      'investigating',
      'scheduled_visit',
      'visit_completed',
      'unresponsive',
      'lab_testing',
      'escalated_kebs',
      'resolved',
      'closed',
      'rejected'
    ],
    default: 'received'
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedAt: Date,
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Inspector actions
  inspectorActions: {
    lastEmailSent: Date,
    emailsSent: [{
      sentAt: {
        type: Date,
        default: Date.now
      },
      template: String,
      recipient: String,
      subject: String,
      status: {
        type: String,
        enum: ['sent', 'delivered', 'read', 'bounced'],
        default: 'sent'
      }
    }],
    scheduledVisit: {
      date: Date,
      time: String,
      address: String,
      inspector: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
        default: 'scheduled'
      },
      notes: String
    },
    visitReports: [{
      visitDate: Date,
      inspector: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      findings: String,
      photos: [{
        url: String,
        description: String
      }],
      recommendations: String,
      followUpRequired: {
        type: Boolean,
        default: false
      },
      nextVisitDate: Date
    }]
  },
  
  // Resolution
  resolution: {
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolution: String,
    actionTaken: String,
    compensationOffered: String
  },
  
  // KEBS escalation
  kebsEscalation: {
    escalated: {
      type: Boolean,
      default: false
    },
    escalatedAt: Date,
    escalatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emailSent: {
      type: Boolean,
      default: false
    },
    emailSentAt: Date,
    pdfUrl: String,
    kebsReferenceNumber: String,
    kebsResponse: String,
    kebsResponseDate: Date
  },
  
  // Timeline/activity log
  timeline: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    action: String,
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  
  // Notes (internal only)
  internalNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // CAPTCHA verification token
  captchaToken: String,
  
  // Tracking system for all complaints (auto-generated, not required in schema)
  trackingToken: {
    type: String,
    unique: true,
    sparse: true, // Only create index if field exists
    index: true
  },
  friendlyToken: {
    type: String,
    unique: true,
    sparse: true, // Only create index if field exists
    index: true
  },
  trackingReference: {
    type: String,
    unique: true,
    sparse: true, // Only create index if field exists
    index: true
  },
  trackingEmail: {
    type: String,
    trim: true,
    lowercase: true
    // Optional email for tracking (not shown to inspectors if anonymous)
  },
  
  // Data retention
  retentionDate: {
    type: Date,
    default: function() {
      // Default 3 years retention
      const date = new Date();
      date.setFullYear(date.getFullYear() + 3);
      return date;
    }
  }
}, {
  timestamps: true
});

// Indexes
complaintSchema.index({ complaintId: 1 }, { unique: true });
complaintSchema.index({ status: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ plant: 1 });
complaintSchema.index({ reporter: 1 });
complaintSchema.index({ batchCode: 1 });
complaintSchema.index({ productCode: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ reportedAt: -1 });
complaintSchema.index({ 'kebsEscalation.escalated': 1 });
complaintSchema.index({ incidentLocation: '2dsphere' });

// Generate complaint ID, tracking tokens, and set priority
complaintSchema.pre('save', async function(next) {
  try {
    if (this.isNew) {
      const { generateComplaintTokens } = require('../utils/tokenGenerator');
      
      // Generate all tracking identifiers if not already set
      if (!this.complaintId || !this.trackingToken || !this.friendlyToken || !this.trackingReference) {
        try {
          const tokens = await generateComplaintTokens(this.constructor);
          
          // Only set if not already provided
          if (!this.complaintId) this.complaintId = tokens.complaintId;
          if (!this.trackingToken) this.trackingToken = tokens.trackingToken;
          if (!this.friendlyToken) this.friendlyToken = tokens.friendlyToken;
          if (!this.trackingReference) this.trackingReference = tokens.trackingReference;
        } catch (tokenError) {
          console.error('Failed to generate complaint tokens:', tokenError);
          return next(new Error('Failed to generate tracking tokens'));
        }
      }
      
      // Auto-assign priority based on category and health impact
      if (!this.priority || this.priority === 'medium') {
        // Critical if health issue with medical attention
        if (this.healthImpact?.hasHealthImpact && this.healthImpact?.medicalAttention) {
          this.priority = 'critical';
        } 
        // High if contamination or health issue
        else if (['contamination', 'health_issue'].includes(this.category)) {
          this.priority = 'high';
        }
        // Medium for foreign objects or expired products
        else if (['foreign_object', 'expired_product'].includes(this.category)) {
          this.priority = 'medium';
        }
        // Low for others
        else {
          this.priority = 'low';
        }
      }
      
      // Add initial timeline entry
      if (!this.timeline || this.timeline.length === 0) {
        this.timeline.push({
          action: 'Complaint submitted',
          timestamp: this.reportedAt,
          notes: `Category: ${this.category}, Priority: ${this.priority}, ID: ${this.complaintId}, Tracking: ${this.friendlyToken}`
        });
      }
    }
    next();
  } catch (error) {
    console.error('Error in complaint pre-save middleware:', error);
    next(error);
  }
});

// Validate that required tokens are generated before save
complaintSchema.pre('save', function(next) {
  // Ensure all tracking tokens are present for new documents
  if (this.isNew) {
    if (!this.complaintId || !this.trackingToken || !this.friendlyToken || !this.trackingReference) {
      return next(new Error('Required tracking tokens were not generated. Please try again.'));
    }
  }
  next();
});

// Add timeline entry on status change
complaintSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      action: `Status changed to ${this.status}`,
      actor: this.assignedTo
    });
  }
  next();
});

complaintSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);