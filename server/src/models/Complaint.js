const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  // Reporter information
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Can be null for anonymous complaints
  },
  reporterName: {
    type: String,
    required: true
  },
  reporterEmail: {
    type: String,
    // Removed match regex to allow empty string if optional
  },
  reporterPhone: {
    type: String,
    required: true,
    // Removed match regex to allow more flexible phone number format
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

// Auto-assign priority based on category and health impact
complaintSchema.pre('save', function(next) {
  if (this.isNew) {
    // Critical if health issue with medical attention
    if (this.healthImpact.hasHealthImpact && this.healthImpact.medicalAttention) {
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
    
    // Add initial timeline entry
    this.timeline.push({
      action: 'Complaint submitted',
      timestamp: this.reportedAt,
      notes: `Category: ${this.category}, Priority: ${this.priority}`
    });
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

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;