const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['consumer', 'owner', 'inspector', 'admin'],
    default: 'consumer'
  },
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    company: String,
    location: {
      address: String,
      county: String,
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  plants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant'
  }],
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
  },
  refreshTokens: [String]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
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

// Update subscription after payment
userSchema.methods.activateSubscription = function(plan, durationDays = 30) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + durationDays);

  this.subscription = {
    plan: plan,
    status: 'active',
    startDate: startDate,
    endDate: endDate
  };

  return this.save();
};

// Check if subscription expires within days
userSchema.methods.isSubscriptionExpiringSoon = function(days = 7) {
  if (!this.hasPremiumAccess()) return false;
  
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + days);
  
  return this.subscription.endDate <= warningDate;
};

// Check if user needs expiry reminder
userSchema.methods.needsExpiryReminder = function() {
  return this.hasPremiumAccess() && this.isSubscriptionExpiringSoon(7);
};

// Deactivate expired subscription
userSchema.methods.deactivateExpiredSubscription = function() {
  if (this.subscription.endDate && new Date() > this.subscription.endDate) {
    this.subscription.status = 'inactive';
    this.subscription.plan = 'free';
    return this.save();
  }
  return Promise.resolve(this);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.refreshTokens;
  return user;
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
