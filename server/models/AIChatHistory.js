/**
 * AI Chat History Model
 * Stores conversation history with AI assistant
 */

const mongoose = require('mongoose');

const aiChatHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
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
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  context: {
    complaintId: {
      type: String
    },
    waterQualityData: {
      type: mongoose.Schema.Types.Mixed
    },
    location: {
      type: String
    }
  },
  summary: {
    type: String
  },
  tags: [{
    type: String,
    index: true
  }],
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
aiChatHistorySchema.index({ userId: 1, createdAt: -1 });
aiChatHistorySchema.index({ sessionId: 1, createdAt: -1 });
aiChatHistorySchema.index({ tags: 1 });
aiChatHistorySchema.index({ 'context.complaintId': 1 });

// Virtual for message count
aiChatHistorySchema.virtual('messageCount').get(function() {
  return this.messages.length;
});

// Virtual for last message
aiChatHistorySchema.virtual('lastMessage').get(function() {
  return this.messages[this.messages.length - 1];
});

// Instance methods
aiChatHistorySchema.methods.addMessage = function(role, content, metadata = {}) {
  this.messages.push({
    role,
    content,
    timestamp: new Date(),
    metadata
  });
  return this.save();
};

module.exports = mongoose.models.AIChatHistory || mongoose.model('AIChatHistory', aiChatHistorySchema);