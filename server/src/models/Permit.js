const mongoose = require('mongoose');

const permitSchema = new mongoose.Schema({
  plant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant',
    required: true
  },
  permitType: {
    type: String,
    required: true,
    enum: [
      'operating_license',
      'water_abstraction',
      'health_certificate',
      'environmental_clearance',
      'product_registration',
      'import_permit',
      'export_permit'
    ]
  },
  permitNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  issuingAuthority: {
    type: String,
    required: true,
    enum: ['KEBS', 'NEMA', 'County Health', 'WRMA', 'Other']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired', 'suspended', 'renewed'],
    default: 'pending'
  },
  issueDate: Date,
  expiryDate: {
    type: Date,
    required: true
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  renewalDate: Date,
  // Document storage
  documents: [{
    name: String,
    url: String,
    s3Key: String,
    fileType: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Conditions and restrictions
  conditions: [{
    condition: String,
    addedDate: Date
  }],
  // Fee information
  fees: {
    applicationFee: Number,
    annualFee: Number,
    currency: {
      type: String,
      default: 'KES'
    },
    paid: {
      type: Boolean,
      default: false
    },
    paidDate: Date,
    receiptNumber: String
  },
  // Inspection requirements
  inspections: [{
    date: Date,
    inspector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    result: {
      type: String,
      enum: ['passed', 'failed', 'conditional']
    },
    notes: String,
    reportUrl: String
  }],
  // Renewal tracking
  renewalReminders: [{
    sentAt: Date,
    method: {
      type: String,
      enum: ['email', 'sms', 'both']
    },
    status: String
  }],
  notes: String
}, {
  timestamps: true
});

// Indexes
permitSchema.index({ plant: 1 });
permitSchema.index({ status: 1 });
permitSchema.index({ expiryDate: 1 });
permitSchema.index({ permitType: 1 });

// Virtual to check if permit is expiring soon (30 days)
permitSchema.virtual('isExpiringSoon').get(function() {
  if (!this.expiryDate) return false;
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return this.expiryDate <= thirtyDaysFromNow && this.expiryDate > new Date();
});

// Virtual to check if expired
permitSchema.virtual('isExpired').get(function() {
  return this.expiryDate && this.expiryDate < new Date();
});

permitSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.models.Permit || mongoose.model('Permit', permitSchema);