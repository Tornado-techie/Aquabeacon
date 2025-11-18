// models/Certification.js
// CREATE THIS FILE

const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  certificationType: {
    type: String,
    enum: ['KEBS', 'WASREB', 'WRA', 'ISO', 'NEMA', 'County', 'Other'],
    required: true
  },
  certificateNumber: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  scope: {
    type: String,
    required: true
  },
  standardReference: {
    type: String // e.g., "KS 05-459:2019" for KEBS water quality standard
  },
  issuedDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'suspended', 'revoked', 'pending'],
    default: 'active'
  },
  issuedBy: {
    organization: {
      type: String,
      required: true
    },
    officerName: String,
    officerTitle: String,
    contactEmail: String,
    contactPhone: String
  },
  applicant: {
    name: String,
    designation: String,
    email: String,
    phone: String
  },
  inspectionDetails: {
    inspectionDate: Date,
    inspector: String,
    findings: String,
    recommendation: String
  },
  documents: [{
    name: String,
    type: {
      type: String,
      enum: ['certificate', 'inspection_report', 'application', 'compliance_doc', 'other']
    },
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  complianceRequirements: [{
    requirement: String,
    status: {
      type: String,
      enum: ['met', 'not_met', 'pending']
    },
    notes: String
  }],
  renewalHistory: [{
    renewedOn: Date,
    previousExpiryDate: Date,
    newExpiryDate: Date,
    notes: String
  }],
  auditSchedule: [{
    auditType: {
      type: String,
      enum: ['surveillance', 'renewal', 'special']
    },
    scheduledDate: Date,
    completedDate: Date,
    auditor: String,
    result: String
  }],
  fees: {
    applicationFee: Number,
    certificationFee: Number,
    renewalFee: Number,
    totalPaid: Number,
    currency: {
      type: String,
      default: 'KES'
    }
  },
  verificationUrl: String, // Public URL to verify certificate authenticity
  qrCode: String, // QR code for quick verification
  notes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  // Auto-update status based on expiry date
  autoCheckStatus: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
certificationSchema.index({ business: 1 });
certificationSchema.index({ certificateNumber: 1 });
certificationSchema.index({ status: 1 });
certificationSchema.index({ expiryDate: 1 });
certificationSchema.index({ certificationType: 1 });

// Middleware to check and update status based on expiry date
certificationSchema.pre('save', function(next) {
  if (this.autoCheckStatus && this.expiryDate) {
    const now = new Date();
    if (this.expiryDate < now && this.status === 'active') {
      this.status = 'expired';
    }
  }
  next();
});

// Method to check if certificate is expiring soon (within 30 days)
certificationSchema.methods.isExpiringSoon = function() {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return this.expiryDate <= thirtyDaysFromNow && this.expiryDate > new Date();
};

// Method to calculate days until expiry
certificationSchema.methods.daysUntilExpiry = function() {
  const now = new Date();
  const diffTime = this.expiryDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

module.exports = mongoose.models.Certification || mongoose.model('Certification', certificationSchema);