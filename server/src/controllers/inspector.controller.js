const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Plant = require('../models/Plant');
const logger = require('../utils/logger');

/**
 * @desc    Get all complaints for inspector dashboard
 * @route   GET /api/inspector/complaints
 * @access  Private (Inspector/Admin only)
 */
exports.getComplaintsForInspector = async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      assignedTo, 
      page = 1, 
      limit = 10,
      sortBy = 'reportedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    // For regular inspectors, show only assigned complaints or unassigned ones
    if (req.user.role === 'inspector' && req.user.role !== 'admin') {
      query.$or = [
        { assignedTo: req.user._id },
        { assignedTo: null }
      ];
    }

    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const complaints = await Complaint.find(query)
      .populate('assignedTo', 'firstName lastName email')
      .populate('reporter', 'firstName lastName email phone')
      .populate('plant', 'name location')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalComplaints = await Complaint.countDocuments(query);

    // Get statistics
    const stats = await getInspectorComplaintStats(req.user._id, req.user.role);

    res.json({
      success: true,
      data: {
        complaints,
        stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalComplaints / limit),
          totalRecords: totalComplaints,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    logger.error('Get inspector complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints'
    });
  }
};

/**
 * @desc    Assign complaint to inspector
 * @route   PUT /api/inspector/complaints/:id/assign
 * @access  Private (Inspector/Admin only)
 */
exports.assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { inspectorId, notes } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Verify inspector exists
    const inspector = await User.findById(inspectorId);
    if (!inspector || inspector.role !== 'inspector') {
      return res.status(400).json({
        success: false,
        message: 'Invalid inspector ID'
      });
    }

    // Update assignment
    complaint.assignedTo = inspectorId;
    complaint.assignedAt = new Date();
    complaint.assignedBy = req.user._id;
    complaint.status = complaint.status === 'received' ? 'under_review' : complaint.status;

    // Add timeline entry
    complaint.timeline.push({
      action: `Complaint assigned to ${inspector.firstName} ${inspector.lastName}`,
      actor: req.user._id,
      notes: notes || `Assigned by ${req.user.firstName} ${req.user.lastName}`
    });

    await complaint.save();

    res.json({
      success: true,
      message: 'Complaint assigned successfully',
      data: complaint
    });

  } catch (error) {
    logger.error('Assign complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign complaint'
    });
  }
};

/**
 * @desc    Update complaint status
 * @route   PUT /api/inspector/complaints/:id/status
 * @access  Private (Inspector/Admin only)
 */
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, actionTaken } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if inspector can update this complaint
    if (req.user.role === 'inspector' && 
        complaint.assignedTo && 
        complaint.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update complaints assigned to you'
      });
    }

    const oldStatus = complaint.status;
    complaint.status = status;

    // Add timeline entry
    complaint.timeline.push({
      action: `Status changed from ${oldStatus} to ${status}`,
      actor: req.user._id,
      notes: notes || actionTaken
    });

    // If resolving, add resolution details
    if (status === 'resolved' && actionTaken) {
      complaint.resolution = {
        resolvedAt: new Date(),
        resolvedBy: req.user._id,
        resolution: actionTaken,
        actionTaken: actionTaken
      };
    }

    await complaint.save();

    res.json({
      success: true,
      message: 'Complaint status updated successfully',
      data: complaint
    });

  } catch (error) {
    logger.error('Update complaint status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint status'
    });
  }
};

/**
 * @desc    Schedule visit to facility
 * @route   POST /api/inspector/complaints/:id/schedule-visit
 * @access  Private (Inspector/Admin only)
 */
exports.scheduleVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, address, notes } = req.body;

    const complaint = await Complaint.findById(id).populate('plant');
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Update complaint with visit details
    complaint.inspectorActions.scheduledVisit = {
      date: new Date(date),
      time,
      address: address || complaint.plant?.location?.address || complaint.incidentLocation?.address,
      inspector: req.user._id,
      status: 'scheduled',
      notes
    };

    complaint.status = 'scheduled_visit';

    // Add timeline entry
    complaint.timeline.push({
      action: `Visit scheduled for ${new Date(date).toLocaleDateString()} at ${time}`,
      actor: req.user._id,
      notes: notes || 'Physical inspection scheduled'
    });

    await complaint.save();

    res.json({
      success: true,
      message: 'Visit scheduled successfully',
      data: {
        visitDetails: complaint.inspectorActions.scheduledVisit,
        complaint: complaint
      }
    });

  } catch (error) {
    logger.error('Schedule visit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule visit'
    });
  }
};

/**
 * @desc    Send email to company
 * @route   POST /api/inspector/complaints/:id/send-email
 * @access  Private (Inspector/Admin only)
 */
exports.sendEmailToCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { template, subject, customMessage, recipientEmail } = req.body;

    const complaint = await Complaint.findById(id).populate('plant');
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Get company email (from plant or complaint data)
    const companyEmail = recipientEmail || complaint.plant?.contact?.email || complaint.plantName;
    
    if (!companyEmail) {
      return res.status(400).json({
        success: false,
        message: 'Company email not available'
      });
    }

    // Email templates
    const templates = {
      'initial_notice': {
        subject: `Water Quality Complaint - Investigation Notice [${complaint.complaintId}]`,
        body: `
Dear ${complaint.plantName || 'Water Business'},

We have received a water quality complaint regarding your facility that requires immediate attention.

Complaint ID: ${complaint.complaintId}
Reported Date: ${complaint.reportedAt.toLocaleDateString()}
Category: ${complaint.category.replace('_', ' ').toUpperCase()}

Please respond within 7 business days with:
1. Your investigation findings
2. Corrective actions taken
3. Preventive measures implemented

Failure to respond may result in regulatory action.

Best regards,
${req.user.firstName} ${req.user.lastName}
Water Quality Inspector
Kenya Bureau of Standards (KEBS)
        `
      },
      'follow_up': {
        subject: `Follow-up: Water Quality Complaint [${complaint.complaintId}]`,
        body: `
Dear ${complaint.plantName || 'Water Business'},

This is a follow-up regarding the water quality complaint filed against your facility.

We have not received your response to our initial notice sent on ${complaint.inspectorActions.lastEmailSent?.toLocaleDateString() || 'previous date'}.

Please provide your response immediately to avoid escalation to enforcement action.

Best regards,
${req.user.firstName} ${req.user.lastName}
Water Quality Inspector
        `
      },
      'visit_notification': {
        subject: `Scheduled Inspection - Water Quality Complaint [${complaint.complaintId}]`,
        body: `
Dear ${complaint.plantName || 'Water Business'},

We are scheduling a physical inspection of your facility regarding complaint ${complaint.complaintId}.

Scheduled Date: ${complaint.inspectorActions.scheduledVisit?.date?.toLocaleDateString() || 'To be determined'}
Time: ${complaint.inspectorActions.scheduledVisit?.time || 'To be determined'}

Please ensure:
- Facility access is available
- Relevant documentation is prepared
- Responsible personnel are present

Best regards,
${req.user.firstName} ${req.user.lastName}
Water Quality Inspector
        `
      },
      'custom': {
        subject: subject || `Regarding Water Quality Complaint [${complaint.complaintId}]`,
        body: customMessage
      }
    };

    const emailContent = templates[template];
    if (!emailContent) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email template'
      });
    }

    // In production, integrate with actual email service (SendGrid, AWS SES, etc.)
    // For now, simulate sending email
    console.log('Sending email:', {
      to: companyEmail,
      subject: emailContent.subject,
      body: emailContent.body
    });

    // Update complaint with email record
    complaint.inspectorActions.emailsSent.push({
      sentAt: new Date(),
      template,
      recipient: companyEmail,
      subject: emailContent.subject,
      status: 'sent'
    });

    complaint.inspectorActions.lastEmailSent = new Date();

    // Add timeline entry
    complaint.timeline.push({
      action: `Email sent to company (${template.replace('_', ' ')})`,
      actor: req.user._id,
      notes: `Email sent to ${companyEmail}`
    });

    await complaint.save();

    res.json({
      success: true,
      message: 'Email sent successfully',
      data: {
        emailSent: {
          recipient: companyEmail,
          subject: emailContent.subject,
          template,
          sentAt: new Date()
        }
      }
    });

  } catch (error) {
    logger.error('Send email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email'
    });
  }
};

/**
 * @desc    Add visit report
 * @route   POST /api/inspector/complaints/:id/visit-report
 * @access  Private (Inspector/Admin only)
 */
exports.addVisitReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { findings, recommendations, followUpRequired, nextVisitDate, photos } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Add visit report
    const visitReport = {
      visitDate: new Date(),
      inspector: req.user._id,
      findings,
      recommendations,
      followUpRequired: followUpRequired || false,
      nextVisitDate: nextVisitDate ? new Date(nextVisitDate) : null,
      photos: photos || []
    };

    complaint.inspectorActions.visitReports.push(visitReport);
    complaint.status = 'visit_completed';

    // Update scheduled visit status
    if (complaint.inspectorActions.scheduledVisit) {
      complaint.inspectorActions.scheduledVisit.status = 'completed';
    }

    // Add timeline entry
    complaint.timeline.push({
      action: 'Inspection visit completed',
      actor: req.user._id,
      notes: `Findings: ${findings.substring(0, 100)}${findings.length > 100 ? '...' : ''}`
    });

    await complaint.save();

    res.json({
      success: true,
      message: 'Visit report added successfully',
      data: visitReport
    });

  } catch (error) {
    logger.error('Add visit report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add visit report'
    });
  }
};

/**
 * @desc    Get inspector statistics
 * @route   GET /api/inspector/stats
 * @access  Private (Inspector/Admin only)
 */
exports.getInspectorStats = async (req, res) => {
  try {
    const stats = await getInspectorComplaintStats(req.user._id, req.user.role);
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Get inspector stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics'
    });
  }
};

/**
 * Helper function to get inspector complaint statistics
 */
async function getInspectorComplaintStats(inspectorId, role) {
  try {
    const baseQuery = role === 'admin' ? {} : { assignedTo: inspectorId };
    
    const stats = await Promise.all([
      Complaint.countDocuments({ ...baseQuery, status: 'received' }),
      Complaint.countDocuments({ ...baseQuery, status: 'under_review' }),
      Complaint.countDocuments({ ...baseQuery, status: 'investigating' }),
      Complaint.countDocuments({ ...baseQuery, status: 'scheduled_visit' }),
      Complaint.countDocuments({ ...baseQuery, status: 'visit_completed' }),
      Complaint.countDocuments({ ...baseQuery, status: 'unresponsive' }),
      Complaint.countDocuments({ ...baseQuery, status: 'resolved' }),
      Complaint.countDocuments({ ...baseQuery, priority: 'critical' }),
      Complaint.countDocuments({ ...baseQuery, priority: 'high' }),
      Complaint.countDocuments({
        ...baseQuery,
        'inspectorActions.scheduledVisit.date': {
          $gte: new Date(),
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        }
      })
    ]);

    return {
      newComplaints: stats[0],
      underReview: stats[1],
      investigating: stats[2],
      scheduledVisits: stats[3],
      completedVisits: stats[4],
      unresponsive: stats[5],
      resolved: stats[6],
      critical: stats[7],
      high: stats[8],
      upcomingVisits: stats[9],
      totalAssigned: role === 'admin' ? 
        await Complaint.countDocuments({}) : 
        await Complaint.countDocuments(baseQuery)
    };
    
  } catch (error) {
    logger.error('Get inspector complaint stats error:', error);
    return {};
  }
}

/**
 * @desc    Get available inspectors
 * @route   GET /api/inspector/inspectors
 * @access  Private (Inspector/Admin only)
 */
exports.getInspectors = async (req, res) => {
  try {
    const inspectors = await User.find({ 
      role: { $in: ['inspector', 'admin'] } 
    }).select('firstName lastName email role');

    res.json({
      success: true,
      data: inspectors
    });

  } catch (error) {
    logger.error('Get inspectors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inspectors'
    });
  }
};

// Export functions individually since they're defined with exports.
// This approach is already working with the exports.functionName pattern above.