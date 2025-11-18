const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['permit_fee', 'subscription', 'inspection_fee', 'lab_test', 'other'],
    required: true
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['Plant', 'Permit', 'Subscription', 'Complaint', 'LabSample']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
    max: 70000
  },
  currency: {
    type: String,
    default: 'KES'
  },
  phoneNumber: {
    type: String,
    required: true,
    match: /^254[0-9]{9}$/
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'expired'],
    default: 'pending'
  },
  // M-Pesa specific fields
  mpesa: {
    merchantRequestID: String,
    checkoutRequestID: String,
    mpesaReceiptNumber: String,
    transactionDate: Date,
    balance: Number,
    resultCode: String,
    resultDescription: String
  },
  // Payment metadata
  description: {
    type: String,
    required: true
  },
  accountReference: {
    type: String,
    required: true
  },
  // Callback and notification tracking
  callbackReceived: {
    type: Boolean,
    default: false
  },
  callbackData: mongoose.Schema.Types.Mixed,
  notificationsSent: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push']
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['sent', 'failed']
    },
    recipient: String
  }],
  // Audit trail
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from creation
    }
  },
  // Additional metadata
  metadata: {
    userAgent: String,
    ipAddress: String,
    source: {
      type: String,
      enum: ['web', 'mobile', 'api'],
      default: 'web'
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ 'mpesa.checkoutRequestID': 1 });
paymentSchema.index({ 'mpesa.merchantRequestID': 1 });
paymentSchema.index({ accountReference: 1 });
paymentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired payments

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return `KSH ${this.amount.toLocaleString()}`;
});

// Method to check if payment is expired
paymentSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Method to mark payment as completed
paymentSchema.methods.markCompleted = function(mpesaData) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.callbackReceived = true;
  
  if (mpesaData) {
    this.mpesa = {
      ...this.mpesa,
      ...mpesaData
    };
  }
  
  return this.save();
};

// Method to mark payment as failed
paymentSchema.methods.markFailed = function(reason) {
  this.status = 'failed';
  this.mpesa.resultDescription = reason;
  return this.save();
};

// Static method to find active payments for a user
paymentSchema.statics.findActivePayments = function(userId) {
  return this.find({
    user: userId,
    status: { $in: ['pending', 'processing'] },
    expiresAt: { $gt: new Date() }
  });
};

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = function(dateRange = {}) {
  const { startDate, endDate } = dateRange;
  const matchQuery = {};
  
  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
    if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
  }

  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    {
      $group: {
        _id: null,
        stats: {
          $push: {
            status: '$_id',
            count: '$count',
            totalAmount: '$totalAmount'
          }
        },
        totalPayments: { $sum: '$count' },
        totalRevenue: { $sum: '$totalAmount' }
      }
    }
  ]);
};

// Static method to find expiring subscriptions (7 days before expiry)
paymentSchema.statics.findExpiringSubscriptions = function() {
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  
  return this.find({
    type: 'subscription',
    status: 'completed',
    'subscription.endDate': {
      $gte: new Date(),
      $lte: sevenDaysFromNow
    },
    'subscription.reminderSent': { $ne: true }
  }).populate('user', 'email profile.firstName profile.lastName');
};

// Add subscription details to payment schema
paymentSchema.add({
  subscription: {
    startDate: Date,
    endDate: Date,
    plan: {
      type: String,
      enum: ['basic', 'premium', 'enterprise']
    },
    reminderSent: {
      type: Boolean,
      default: false
    },
    renewalAttempted: {
      type: Boolean,
      default: false
    }
  }
});

module.exports = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);