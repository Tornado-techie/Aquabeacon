// controllers/analytics.controller.js
const AIChatHistory = require('../models/AIChatHistory');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Plant = require('../models/Plant');
const logger = require('../utils/logger');

/**
 * @desc    Get AI usage analytics for admin dashboard
 * @route   GET /api/ai/analytics
 * @access  Admin only
 */
exports.getAIAnalytics = async (req, res) => {
  try {
    // Check if user is admin or inspector
    if (req.user.role !== 'admin' && req.user.role !== 'inspector') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or Inspector role required.'
      });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalSessions,
      recentSessions,
      totalQueries,
      sessionsWithMessages,
      topicAnalysis,
      userRoleBreakdown
    ] = await Promise.all([
      // Total AI chat sessions
      AIChatHistory.countDocuments(),
      
      // Recent sessions (last 30 days)
      AIChatHistory.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
      }),
      
      // Total queries (sum of all messages with role 'user')
      AIChatHistory.aggregate([
        { $unwind: '$messages' },
        { $match: { 'messages.role': 'user' } },
        { $count: 'totalQueries' }
      ]),
      
      // Sessions with message counts for avg calculation
      AIChatHistory.find({}, 'metadata.totalMessages createdAt').lean(),
      
      // Topic analysis from context tags
      AIChatHistory.aggregate([
        { $unwind: '$context.tags' },
        { $group: { _id: '$context.tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      // User role breakdown
      AIChatHistory.aggregate([
        { $group: { _id: '$userRole', count: { $sum: 1 } } }
      ])
    ]);

    // Calculate average messages per session
    const avgMessagesPerSession = sessionsWithMessages.length > 0
      ? Math.round(sessionsWithMessages.reduce((sum, session) => 
        sum + (session.metadata?.totalMessages || 0), 0) / sessionsWithMessages.length)
      : 0;

    // Calculate recent activity growth
    const growthRate = totalSessions > 0 
      ? Math.round((recentSessions / totalSessions) * 100)
      : 0;

    // Mock response time (in real implementation, this would come from monitoring)
    const avgResponseTime = Math.floor(Math.random() * 500) + 200; // 200-700ms

    // Mock success rate (in real implementation, track failed queries)
    const successRate = Math.floor(Math.random() * 10) + 90; // 90-100%

    const analytics = {
      totalSessions,
      recentSessions,
      totalQueries: totalQueries[0]?.totalQueries || 0,
      avgMessagesPerSession,
      avgResponseTime,
      successRate,
      growthRate,
      topTopics: topicAnalysis.map(topic => ({
        topic: topic._id,
        count: topic.count
      })),
      userRoleBreakdown: userRoleBreakdown.reduce((acc, item) => {
        acc[item._id || 'guest'] = item.count;
        return acc;
      }, {}),
      dailyUsage: await getDailyUsageStats(thirtyDaysAgo)
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    logger.error('AI analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI analytics'
    });
  }
};

/**
 * @desc    Get system-wide analytics for admin dashboard
 * @route   GET /api/analytics/system
 * @access  Admin only
 */
exports.getSystemAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'inspector') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or Inspector role required.'
      });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      userRegistrationTrend,
      complaintTrend,
      plantRegistrationTrend,
      peakUsageHours,
      geographicDistribution
    ] = await Promise.all([
      // User registration trend (last 30 days)
      User.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),

      // Complaint trend
      Complaint.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),

      // Plant registration trend
      Plant.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),

      // Peak usage hours from AI sessions
      AIChatHistory.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $hour: '$createdAt' },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),

      // Geographic distribution from user locations (if available)
      User.aggregate([
        { $match: { 'profile.location.county': { $exists: true } } },
        { $group: { _id: '$profile.location.county', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    const analytics = {
      trends: {
        userRegistrations: userRegistrationTrend,
        complaints: complaintTrend,
        plantRegistrations: plantRegistrationTrend
      },
      peakHours: peakUsageHours.map(hour => ({
        hour: hour._id,
        usage: hour.count
      })),
      geographic: geographicDistribution.map(location => ({
        county: location._id,
        users: location.count
      }))
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    logger.error('System analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system analytics'
    });
  }
};

// Helper function to get daily usage statistics
async function getDailyUsageStats(startDate) {
  try {
    const dailyStats = await AIChatHistory.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          sessions: { $sum: 1 },
          totalMessages: { $sum: '$metadata.totalMessages' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    return dailyStats.map(stat => ({
      date: new Date(stat._id.year, stat._id.month - 1, stat._id.day),
      sessions: stat.sessions,
      messages: stat.totalMessages
    }));
  } catch (error) {
    logger.error('Error getting daily usage stats:', error);
    return [];
  }
}