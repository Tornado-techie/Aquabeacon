const mongoose = require('mongoose');

const trainingModuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    required: true,
    enum: [
      'water_quality',
      'hygiene',
      'equipment_maintenance',
      'regulatory_compliance',
      'safety',
      'business_management',
      'lab_procedures'
    ]
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  duration: {
    type: Number,
    required: true
  },
  content: [{
    type: {
      type: String,
      enum: ['text', 'video', 'pdf', 'quiz', 'interactive']
    },
    title: String,
    body: String,
    url: String,
    s3Key: String,
    duration: Number
  }],
  assessment: {
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      explanation: String
    }],
    passingScore: {
      type: Number,
      default: 70
    }
  },
  certificateTemplate: String,
  certificateValidity: Number,
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingModule'
  }],
  relatedStandards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Standard'
  }],
  completions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: Date,
    score: Number,
    certificateUrl: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  instructor: String,
  tags: [String]
}, {
  timestamps: true
});

trainingModuleSchema.index({ category: 1 });
trainingModuleSchema.index({ level: 1 });
trainingModuleSchema.index({ isActive: 1 });

module.exports = mongoose.models.TrainingModule || mongoose.model('TrainingModule', trainingModuleSchema);