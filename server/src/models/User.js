const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // Re-enabled unique constraint for production
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number']
  },
  role: {
    type: String,
    enum: ['consumer', 'owner', 'inspector', 'admin'],
    default: 'consumer'
  },
  // For multi-tenant consultant support
  isConsultant: {
    type: Boolean,
    default: false
  },
  consultantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Profile information
  businessName: {
    type: String,
    trim: true
  },
  businessRegistration: {
    type: String,
    trim: true
  },
  nationalId: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    county: String,
    postalCode: String
  },
  // Verification status
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Refresh token for JWT
  refreshToken: {
    type: String,
    select: false
  },
  // Password reset
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  // Login tracking
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  // Premium subscription fields
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'past_due'],
      default: 'inactive'
    },
    startDate: Date,
    endDate: Date,
    paymentMethod: String,
    stripeCustomerId: String,
    stripeSubscriptionId: String
  }
}, {
  timestamps: true
});

// Indexes
// userSchema.index({ email: 1 }); // Already unique via schema definition
userSchema.index({ role: 1 });
userSchema.index({ consultantId: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function() {
  const crypto = require('crypto');
  return crypto.randomBytes(40).toString('hex');
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Check if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  // Increment attempts
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLogin: Date.now() },
    $unset: { lockUntil: 1 }
  });
};

// Check if user has premium access
userSchema.methods.hasPremiumAccess = function() {
  if (this.subscription.plan === 'free') return false;
  if (this.subscription.status !== 'active') return false;
  if (this.subscription.endDate && new Date() > this.subscription.endDate) return false;
  return true;
};

// Check subscription level
userSchema.methods.hasAccessLevel = function(requiredLevel) {
  const levels = { free: 0, basic: 1, premium: 2, enterprise: 3 };
  const userLevel = levels[this.subscription.plan] || 0;
  const required = levels[requiredLevel] || 0;
  return userLevel >= required && this.hasPremiumAccess();
};

// Ensure virtuals are included in JSON
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.refreshToken;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);