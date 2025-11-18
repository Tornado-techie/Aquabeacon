// models/Payment.js
// CREATE THIS FILE

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'KES',
    enum: ['KES', 'USD', 'EUR']
  },
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'card', 'bank_transfer', 'paypal', 'stripe'],
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  mpesaReceiptNumber: String,
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  purpose: {
    type: String,
    enum: ['subscription', 'certification', 'testing', 'consultation', 'other'],
    required: true
  },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise']
  },
  subscriptionDuration: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly']
  },
  startDate: Date,
  endDate: Date,
  description: String,
  invoice: {
    number: String,
    url: String,
    generatedAt: Date
  },
  receipt: {
    number: String,
    url: String,
    generatedAt: Date
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    platform: String
  },
  refund: {
    requested: {
      type: Boolean,
      default: false
    },
    requestedAt: Date,
    reason: String,
    approved: Boolean,
    approvedAt: Date,
    refundedAmount: Number
  },
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
  }]
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ purpose: 1 });

// Generate receipt number
paymentSchema.pre('save', function(next) {
  if (this.isNew && !this.receipt.number) {
    this.receipt.number = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);