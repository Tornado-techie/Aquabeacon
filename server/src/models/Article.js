const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 300
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['standards', 'testing', 'treatment', 'business', 'regulations', 'safety']
  },
  subcategory: {
    type: String,
    required: true
  },
  tags: [String],
  accessLevel: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise'],
    default: 'free'
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  author: {
    name: String,
    email: String,
    bio: String
  },
  featuredImage: {
    url: String,
    alt: String
  },
  readTime: {
    type: Number, // minutes
    default: 5
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  }
}, {
  timestamps: true
});

// Index for search
articleSchema.index({ title: 'text', content: 'text', tags: 'text' });
articleSchema.index({ category: 1, subcategory: 1 });
articleSchema.index({ accessLevel: 1, status: 1 });

// Generate preview (first 150 words for non-premium users)
articleSchema.methods.getPreview = function() {
  const words = this.content.split(' ');
  return words.slice(0, 150).join(' ') + (words.length > 150 ? '...' : '');
};

// Check if user can access full content
articleSchema.methods.canUserAccess = function(user) {
  if (!this.isPremium) return true;
  if (!user) return false;
  return user.hasAccessLevel && user.hasAccessLevel(this.accessLevel);
};

module.exports = mongoose.models.Article || mongoose.model('Article', articleSchema);