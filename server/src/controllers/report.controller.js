// controllers/report.controller.js
// CREATE THIS FILE

const WaterIssue = require('../models/WaterIssue');
const logger = require('../utils/logger');
// const path = require('path'); // Unused for now

/**
 * @desc    Create new water quality report
 * @route   POST /api/reports
 * @access  Private
 */
exports.createReport = async (req, res) => {
  try {
    const {
      title,
      description,
      issueType,
      severity,
      location,
      waterParameters,
      affectedPeople
    } = req.body;

    logger.info(`Creating water report by user: ${req.user._id}`);

    // Handle uploaded photos
    const photos = req.files ? req.files.map(file => ({
      filename: file.filename,
      path: file.path,
      url: `/uploads/reports/${file.filename}`
    })) : [];

    // Create report
    const report = await WaterIssue.create({
      reportedBy: req.user._id,
      title,
      description,
      issueType,
      severity,
      location: {
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        address: location.address || '',
        county: location.county || '',
        subCounty: location.subCounty || '',
        town: location.town || '',
        landmark: location.landmark || ''
      },
      photos,
      waterParameters: waterParameters || {},
      affectedPeople: affectedPeople || 0,
      status: 'pending',
      priority: severity === 'critical' ? 'urgent' : severity
    });

    // Populate reporter info
    await report.populate('reportedBy', 'firstName lastName email phoneNumber');

    logger.info(`Water report created successfully: ${report._id}`);

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: report
    });
  } catch (error) {
    logger.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all reports (filtered by role)
 * @route   GET /api/reports
 * @access  Private
 */
exports.getReports = async (req, res) => {
  try {
    const {
      status,
      issueType,
      severity,
      county,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const userId = req.user._id;
    const userRole = req.user.role;

    // Build query based on user role
    const query = {};

    if (userRole === 'consumer') {
      // Consumers only see their own reports
      query.reportedBy = userId;
    } else if (userRole === 'inspector') {
      // Inspectors see assigned reports or all public reports
      query.$or = [
        { assignedTo: userId },
        { isPublic: true }
      ];
    }
    // Admin sees all reports (no filter)

    // Apply filters
    if (status) query.status = status;
    if (issueType) query.issueType = issueType;
    if (severity) query.severity = severity;
    if (county) query['location.county'] = county;

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    // Execute query with pagination
    const reports = await WaterIssue.find(query)
      .populate('reportedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count
    const count = await WaterIssue.countDocuments(query);

    res.json({
      success: true,
      data: reports,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get single report by ID
 * @route   GET /api/reports/:id
 * @access  Private
 */
exports.getReportById = async (req, res) => {
  try {
    const report = await WaterIssue.findById(req.params.id)
      .populate('reportedBy', 'firstName lastName email phone')
      .populate('assignedTo', 'firstName lastName email')
      .populate('notes.addedBy', 'firstName lastName');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user has permission to view
    const userId = req.user._id.toString();
    const userRole = req.user.role;

    if (
      userRole !== 'admin' &&
      userRole !== 'inspector' &&
      report.reportedBy._id.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this report'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('Get report by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update report
 * @route   PATCH /api/reports/:id
 * @access  Private
 */
exports.updateReport = async (req, res) => {
  try {
    const report = await WaterIssue.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const userId = req.user._id.toString();
    const userRole = req.user.role;

    // Check permissions
    const isOwner = report.reportedBy.toString() === userId;
    const isInspector = userRole === 'inspector';
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isInspector && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this report'
      });
    }

    // Consumers can only update their own unassigned reports
    if (isOwner && !isInspector && !isAdmin) {
      if (report.status !== 'pending' || report.assignedTo) {
        return res.status(403).json({
          success: false,
          message: 'Cannot update report once it has been assigned or is being investigated'
        });
      }
    }

    // Update fields
    const allowedUpdates = ['title', 'description', 'severity', 'waterParameters'];
    const inspectorUpdates = ['status', 'priority', 'assignedTo'];

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        report[key] = req.body[key];
      } else if ((isInspector || isAdmin) && inspectorUpdates.includes(key)) {
        report[key] = req.body[key];
      }
    });

    // Add note if provided
    if (req.body.note) {
      report.notes.push({
        addedBy: userId,
        note: req.body.note
      });
    }

    // Set resolved date if status changed to resolved
    if (req.body.status === 'resolved' && report.status !== 'resolved') {
      report.resolvedAt = new Date();
    }

    await report.save();
    await report.populate('reportedBy', 'firstName lastName email');
    await report.populate('assignedTo', 'firstName lastName');

    logger.info(`Report updated: ${report._id} by user: ${userId}`);

    res.json({
      success: true,
      message: 'Report updated successfully',
      data: report
    });
  } catch (error) {
    logger.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Delete report
 * @route   DELETE /api/reports/:id
 * @access  Private (Own reports only)
 */
exports.deleteReport = async (req, res) => {
  try {
    const report = await WaterIssue.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const userId = req.user._id.toString();
    const isOwner = report.reportedBy.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this report'
      });
    }

    // Don't allow deletion if report is being investigated
    if (report.status !== 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete report once investigation has started'
      });
    }

    await report.deleteOne();

    logger.info(`Report deleted: ${report._id} by user: ${userId}`);

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    logger.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get reports near a location
 * @route   GET /api/reports/nearby/:latitude/:longitude
 * @access  Private
 */
exports.getNearbyReports = async (req, res) => {
  try {
    const { latitude, longitude } = req.params;
    const { radius = 5000, limit = 20 } = req.query; // radius in meters, default 5km

    const reports = await WaterIssue.find({
      isPublic: true,
      'location.latitude': {
        $gte: parseFloat(latitude) - 0.05,
        $lte: parseFloat(latitude) + 0.05
      },
      'location.longitude': {
        $gte: parseFloat(longitude) - 0.05,
        $lte: parseFloat(longitude) + 0.05
      }
    })
      .populate('reportedBy', 'firstName lastName')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reports,
      count: reports.length
    });
  } catch (error) {
    logger.error('Get nearby reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby reports',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update report status (admin/inspector only)
 * @route   PATCH /api/reports/:id/status
 * @access  Private (admin/inspector)
 */
exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response, inspectorNotes } = req.body;

    const validStatuses = ['pending', 'investigating', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const report = await WaterIssue.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Update report
    report.status = status;
    report.lastUpdated = new Date();
    report.handledBy = req.user._id;

    if (response) report.response = response;
    if (inspectorNotes) report.inspectorNotes = inspectorNotes;

    await report.save();

    await report.populate('reportedBy', 'fullName email');
    await report.populate('handledBy', 'fullName email');

    logger.info(`Report ${id} status updated to ${status} by user ${req.user._id}`);

    res.json({
      success: true,
      message: 'Report status updated successfully',
      data: report
    });

  } catch (error) {
    logger.error('Update report status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};