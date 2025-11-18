// controllers/dashboard.controller.js
// UPDATED VERSION WITH AVAILABLE MODELS

const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Plant = require('../models/Plant');
const Permit = require('../models/Permit');
const logger = require('../utils/logger');

/**
 * @desc    Get dashboard statistics based on user role
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    logger.info(`Dashboard stats requested by user: ${userId}, role: ${userRole}`);

    let stats = {};

    // Role-based statistics
    switch (userRole) {
    case 'inspector':
      stats = await getInspectorStats(userId);
      break;
    case 'owner':
      stats = await getOwnerStats(userId);
      break;
    case 'consumer':
      stats = await getConsumerStats(userId);
      break;
    case 'admin':
      stats = await getAdminStats();
      break;
    default:
      stats = await getConsumerStats(userId);
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get recent activities
 * @route   GET /api/dashboard/activities
 * @access  Private
 */
exports.getRecentActivities = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const limit = parseInt(req.query.limit) || 10;

    let activities = [];

    if (userRole === 'inspector') {
      // Get recent complaints assigned to inspector
      const complaints = await Complaint.find({ assignedTo: userId })
        .sort({ createdAt: -1 })
        .limit(limit);

      activities = complaints.map(complaint => ({
        type: 'inspection',
        title: `Inspected: ${complaint.title || 'Complaint'}`,
        description: `Status: ${complaint.status}`,
        date: complaint.createdAt,
        status: complaint.status
      }));
    } else if (userRole === 'owner') {
      // Get owner's plants and permits
      const plants = await Plant.find({ owner: userId })
        .sort({ createdAt: -1 })
        .limit(limit);

      activities = plants.map(plant => ({
        type: 'plant',
        title: `Plant: ${plant.name}`,
        description: `Status: ${plant.status}`,
        date: plant.createdAt,
        status: plant.status
      }));
    } else {
      // Get user's complaint reports
      const reports = await Complaint.find({ reportedBy: userId })
        .sort({ createdAt: -1 })
        .limit(limit);

      activities = reports.map(report => ({
        type: 'report',
        title: report.title,
        description: `${report.complaintType} - ${report.status}`,
        date: report.createdAt,
        status: report.status
      }));
    }

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    logger.error('Recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities'
    });
  }
};

// ============================================
// HELPER FUNCTIONS FOR ROLE-BASED STATS
// ============================================

async function getInspectorStats(userId) {
  const [
    totalComplaints,
    pendingComplaints,
    resolvedComplaints,
    recentComplaints
  ] = await Promise.all([
    Complaint.countDocuments({ assignedTo: userId }),
    Complaint.countDocuments({ assignedTo: userId, status: { $in: ['pending', 'investigating'] } }),
    Complaint.countDocuments({ assignedTo: userId, status: 'resolved' }),
    Complaint.find({ assignedTo: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('reportedBy', 'firstName lastName email')
  ]);

  return {
    overview: {
      totalComplaints,
      pendingComplaints,
      resolvedComplaints,
      resolutionRate: totalComplaints > 0 
        ? Math.round((resolvedComplaints / totalComplaints) * 100) 
        : 0
    },
    recentComplaints: recentComplaints.map(complaint => ({
      id: complaint._id,
      title: complaint.title,
      complaintType: complaint.complaintType,
      severity: complaint.severity,
      status: complaint.status,
      location: complaint.location,
      reportedBy: complaint.reportedBy 
        ? `${complaint.reportedBy.firstName} ${complaint.reportedBy.lastName}` 
        : 'Unknown',
      createdAt: complaint.createdAt
    }))
  };
}

async function getOwnerStats(userId) {
  const [
    totalPlants,
    activePlants,
    totalPermits,
    activePermits,
    expiredPermits,
    recentPlants
  ] = await Promise.all([
    Plant.countDocuments({ owner: userId }),
    Plant.countDocuments({ owner: userId, status: 'active' }),
    Permit.countDocuments({ plant: { $in: await Plant.find({ owner: userId }).select('_id') } }),
    Permit.countDocuments({ plant: { $in: await Plant.find({ owner: userId }).select('_id') }, status: 'active' }),
    Permit.countDocuments({ plant: { $in: await Plant.find({ owner: userId }).select('_id') }, status: 'expired' }),
    Plant.find({ owner: userId })
      .sort({ createdAt: -1 })
      .limit(5)
  ]);

  return {
    overview: {
      totalPlants,
      activePlants,
      totalPermits,
      activePermits,
      expiredPermits
    },
    recentPlants: recentPlants.map(plant => ({
      id: plant._id,
      name: plant.name,
      type: plant.type,
      status: plant.status,
      location: plant.location,
      createdAt: plant.createdAt
    }))
  };
}

async function getConsumerStats(userId) {
  const [
    totalComplaints,
    pendingComplaints,
    resolvedComplaints,
    recentComplaints
  ] = await Promise.all([
    Complaint.countDocuments({ reportedBy: userId }),
    Complaint.countDocuments({ reportedBy: userId, status: { $in: ['pending', 'investigating'] } }),
    Complaint.countDocuments({ reportedBy: userId, status: 'resolved' }),
    Complaint.find({ reportedBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
  ]);

  // Get complaints by type
  const typeBreakdown = await Complaint.aggregate([
    { $match: { reportedBy: userId } },
    { $group: { _id: '$complaintType', count: { $sum: 1 } } }
  ]);

  return {
    overview: {
      totalComplaints,
      pendingComplaints,
      resolvedComplaints,
      resolutionRate: totalComplaints > 0 
        ? Math.round((resolvedComplaints / totalComplaints) * 100) 
        : 0
    },
    typeBreakdown: typeBreakdown.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    recentComplaints: recentComplaints.map(complaint => ({
      id: complaint._id,
      title: complaint.title,
      complaintType: complaint.complaintType,
      severity: complaint.severity,
      status: complaint.status,
      location: complaint.location,
      createdAt: complaint.createdAt
    }))
  };
}

async function getAdminStats() {
  const [
    totalUsers,
    totalComplaints,
    pendingComplaints,
    totalPlants,
    activePlants,
    totalPermits
  ] = await Promise.all([
    User.countDocuments(),
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: { $in: ['pending', 'investigating'] } }),
    Plant.countDocuments(),
    Plant.countDocuments({ status: 'active' }),
    Permit.countDocuments()
  ]);

  // Users by role
  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);

  // Complaints by status
  const complaintsByStatus = await Complaint.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Recent activity
  const recentComplaints = await Complaint.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('reportedBy', 'firstName lastName email');

  return {
    overview: {
      totalUsers,
      totalComplaints,
      pendingComplaints,
      totalPlants,
      activePlants,
      totalPermits
    },
    usersByRole: usersByRole.reduce((acc, item) => {
      acc[item._id || 'unknown'] = item.count;
      return acc;
    }, {}),
    complaintsByStatus: complaintsByStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    recentComplaints: recentComplaints.map(complaint => ({
      id: complaint._id,
      title: complaint.title,
      complaintType: complaint.complaintType,
      severity: complaint.severity,
      status: complaint.status,
      reportedBy: complaint.reportedBy 
        ? `${complaint.reportedBy.firstName} ${complaint.reportedBy.lastName}` 
        : 'Unknown',
      createdAt: complaint.createdAt
    }))
  };
}