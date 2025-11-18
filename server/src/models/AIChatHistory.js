const mongoose = require('mongoose');

const aiChatHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow guest users
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  userRole: {
    type: String,
    enum: ['consumer', 'owner', 'inspector', 'admin', 'guest'],
    default: 'guest'
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  context: {
    plantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plant'
    },
    topic: String,
    tags: [String]
  },
  metadata: {
    totalMessages: {
      type: Number,
      default: 0
    },
    lastActiveAt: {
      type: Date,
      default: Date.now
    },
    userAgent: String,
    ipAddress: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
aiChatHistorySchema.index({ userId: 1, createdAt: -1 });
aiChatHistorySchema.index({ sessionId: 1, 'metadata.lastActiveAt': -1 });

// Update lastActiveAt on new message
aiChatHistorySchema.pre('save', function(next) {
  this.metadata.lastActiveAt = Date.now();
  this.metadata.totalMessages = this.messages.length;
  next();
});

module.exports = mongoose.models.AIChatHistory || mongoose.model('AIChatHistory', aiChatHistorySchema);