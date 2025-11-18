const Complaint = require('../models/Complaint');
const logger = require('../utils/logger');
const notificationService = require('../services/notification.service');

// Submit complaint with enhanced debugging and file handling
exports.submitComplaint = async (req, res) => {
  try {
    console.log('=== COMPLAINT SUBMISSION DEBUG ===');
    console.log('Request method:', req.method);
    console.log('Request path:', req.path);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('req.body:', JSON.stringify(req.body, null, 2));
    console.log('req.files count:', req.files ? req.files.length : 0);
    console.log('req.user ID:', req.user?._id);

    if (req.files && req.files.length > 0) {
      console.log('Files received:', req.files.map(f => ({
        fieldname: f.fieldname,
        originalname: f.originalname,
        filename: f.filename,
        mimetype: f.mimetype,
        size: f.size,
        path: f.path
      })));
    }

    // Handle both authenticated and anonymous submissions
    const isAuthenticated = !!req.user;
    const isAnonymous = req.body.isAnonymous === 'true' || req.body.isAnonymous === true;

    console.log('Authentication status:', { isAuthenticated, isAnonymous });

    // ALL COMPLAINTS ARE ALLOWED WITHOUT AUTHENTICATION
    // No authentication check needed - anyone can submit complaints

    const {
      description,
      category,
      affectedPeople,
      // Consumer/reporter info (for anonymous complaints)
      consumerName,
      consumerEmail,
      consumerPhone,
      reportedBusinessName,
      productCode,
      batchCode,
      complaintType,
      // Optional tracking email for anonymous complaints
      trackingEmail
    } = req.body;

    // Parse location data (handle different formats from frontend)
    let locationData;
    
    if (req.body.location && typeof req.body.location === 'string') {
      // Handle comma-separated string format: "-1.2812288, 36.8377856"
      const coords = req.body.location.split(',');
      if (coords.length === 2) {
        locationData = {
          latitude: parseFloat(coords[0].trim()),
          longitude: parseFloat(coords[1].trim()),
          address: req.body.address || '',
          county: req.body.county || '',
          town: req.body.town || '',
          landmark: req.body.landmark || ''
        };
      }
    } else {
      // Handle nested field format: location[latitude], location[longitude]
      locationData = {
        latitude: parseFloat(req.body['location[latitude]']) || parseFloat(req.body.latitude) || null,
        longitude: parseFloat(req.body['location[longitude]']) || parseFloat(req.body.longitude) || null,
        address: req.body['location[address]'] || req.body.address || '',
        county: req.body['location[county]'] || req.body.county || '',
        town: req.body['location[town]'] || req.body.town || '',
        landmark: req.body['location[landmark]'] || req.body.landmark || ''
      };
    }

    console.log('Parsed location data:', locationData);

    // Validate location coordinates
    if (!locationData.latitude || !locationData.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Location coordinates (latitude and longitude) are required'
      });
    }

    // Process uploaded files
    const attachments = req.files ? req.files.map(file => {
      // Create relative URL for frontend access
      const relativePath = file.path.replace(/\\/g, '/'); // Normalize path separators
      const urlPath = relativePath.startsWith('uploads/') ? `/${relativePath}` : `/uploads/complaints/${file.filename}`;
      
      return {
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        url: urlPath,
        size: file.size,
        mimetype: file.mimetype,
        uploadDate: new Date()
      };
    }) : [];

    console.log('Processed attachments:', attachments);

    // Map frontend complaint types to backend categories
    const categoryMapping = {
      'quality': 'bad_taste', // Water Quality Issue (odor, taste, color, turbidity, etc.)
      'contamination': 'contamination', // Suspected Contamination
      'packaging': 'packaging_damage', // Packaging Defect
      'other': 'other',
      // Additional mappings for specific quality issues
      'bad_taste': 'bad_taste',
      'bad_smell': 'bad_smell',
      'foreign_object': 'foreign_object',
      'health_issue': 'health_issue',
      'expired_product': 'expired_product',
      'false_labeling': 'false_labeling'
    };

    const mappedCategory = categoryMapping[complaintType] || categoryMapping[category] || 'other';

    console.log('Category mapping:', { complaintType, category, mappedCategory });

    // Create complaint object matching the Complaint model schema
    const complaintData = {
      reporter: isAuthenticated ? req.user._id : null, // null for unauthenticated users
      reporterName: consumerName || (isAuthenticated ? req.user?.fullName : ''),
      reporterEmail: consumerEmail || (isAuthenticated ? req.user?.email : ''),
      reporterPhone: consumerPhone || (isAuthenticated ? req.user?.phoneNumber : ''),
      isAnonymous: isAnonymous || !isAuthenticated, // Anonymous if explicitly set or not authenticated
      
      // Tracking system for anonymous complaints
      trackingEmail: trackingEmail || null, // Optional tracking email
      
      // Business/product info
      plantName: reportedBusinessName,
      productCode: productCode,
      batchCode: batchCode,
      
      // Complaint details
      category: mappedCategory, // Use mapped category
      description: description.trim(),
      
      // Location (renamed to match schema)
      incidentLocation: {
        type: 'Point',
        coordinates: [locationData.longitude, locationData.latitude],
        address: `${locationData.address} ${locationData.county} ${locationData.town} ${locationData.landmark}`.trim()
      },
      
      // Files (renamed to match schema)
      photos: attachments.map(attachment => ({
        url: attachment.url,
        description: attachment.originalName,
        uploadedAt: attachment.uploadDate
      })),
      
      // Other fields
      status: 'received', // Use correct enum value
      reportedAt: new Date()
    };

    console.log('Creating complaint with data:', JSON.stringify(complaintData, null, 2));

    // Save to database
    const complaint = await Complaint.create(complaintData);

    // Log successful creation
    console.log('✅ Complaint created successfully with ID:', complaint._id);
    logger.info(`Complaint submitted by ${isAuthenticated ? `user ${req.user._id}` : 'anonymous user'}: ${complaint._id}`);

    // Send real-time notification to inspectors and admins
    try {
      await notificationService.notifyInspectors('complaint_created', {
        complaintId: complaint._id,
        complaintTitle: `${complaint.category} - ${complaint.plantName || 'Unknown Business'}`,
        category: complaint.category,
        location: complaint.incidentLocation.address,
        isUrgent: complaint.severity === 'high' || complaint.category === 'contamination',
        reportedBy: complaint.isAnonymous ? 'Anonymous' : complaint.reporterName
      });

      await notificationService.notifyAdmins('complaint_created', {
        complaintId: complaint._id,
        complaintTitle: `${complaint.category} - ${complaint.plantName || 'Unknown Business'}`,
        category: complaint.category,
        location: complaint.incidentLocation.address,
        reportedBy: complaint.isAnonymous ? 'Anonymous' : complaint.reporterName
      });

      logger.info(`Real-time notifications sent for new complaint: ${complaint._id}`);
    } catch (notifError) {
      logger.error('Failed to send real-time notifications:', notifError);
      // Don't fail the complaint submission if notifications fail
    }

    // Send success response with comprehensive tracking information
    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: {
        id: complaint._id,
        complaintId: complaint.complaintId,
        category: complaint.category,
        status: complaint.status,
        reportedAt: complaint.reportedAt,
        photoCount: complaint.photos.length,
        location: {
          address: complaint.incidentLocation.address
        },
        isAnonymous: complaint.isAnonymous,
        // Include tracking info for ALL complaints (not just anonymous)
        tracking: {
          complaintId: complaint.complaintId,
          trackingToken: complaint.trackingToken,
          friendlyToken: complaint.friendlyToken,
          trackingReference: complaint.trackingReference,
          trackingUrl: `/track/${complaint.friendlyToken}`,
          alternativeTrackingUrl: `/track/${complaint.trackingReference}`,
          // User-friendly message
          message: `Your complaint has been registered with ID: ${complaint.complaintId}. You can track it using: ${complaint.friendlyToken}`
        }
      }
    });

  } catch (error) {
    console.error('=== COMPLAINT SUBMISSION ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);

    // Log error for monitoring
    logger.error('Complaint submission failed:', {
      userId: req.user?._id,
      error: error.message,
      stack: error.stack
    });

    // Handle specific database errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate complaint detected'
      });
    }

    // Handle cast errors (invalid ObjectId, etc.)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format'
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Failed to submit complaint',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user complaints with pagination
exports.getUserComplaints = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const complaints = await Complaint.find({ reporter: req.user._id })
      .sort({ reportedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('reporter', 'fullName email')
      .lean();

    const total = await Complaint.countDocuments({ reporter: req.user._id });

    res.json({
      success: true,
      data: {
        complaints,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get user complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints'
    });
  }
};

// Update complaint status (for inspectors/admins)
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response, inspectorNotes } = req.body;

    const validStatuses = ['received','under_review','investigating','lab_testing','escalated_kebs','resolved','closed','rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Store old status for notification
    const oldStatus = complaint.status;
  
    // Update complaint
    complaint.status = status;
    complaint.lastUpdated = new Date();
    complaint.assignedTo = req.user._id;

    if (response) complaint.response = response;
    if (inspectorNotes) complaint.inspectorNotes = inspectorNotes;

    await complaint.save();

    // Send real-time notification for status update
    try {
      await notificationService.notifyComplaintStatusUpdate(
        complaint,
        oldStatus,
        status,
        req.user
      );
      logger.info(`Status update notification sent for complaint: ${complaint._id}`);
    } catch (notifError) {
      logger.error('Failed to send status update notification:', notifError);
    }

    res.json({
      success: true,
      message: 'Complaint status updated successfully',
      data: complaint
    });

  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint status'
    });
  }
};

// Get all complaints (admin/inspector view)
exports.getComplaints = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const priority = req.query.priority;

    // Build filter query
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const complaints = await Complaint.find(filter)
      .sort({ reportedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('reporter', 'fullName email phoneNumber')
      .populate('assignedTo', 'fullName email')
      .lean();

    const total = await Complaint.countDocuments(filter);

    res.json({
      success: true,
      data: {
        complaints,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Get complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints'
    });
  }
};

// Get specific complaint by ID
exports.getComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id)
      .populate('reporter', 'fullName email phoneNumber')
      .populate('assignedTo', 'fullName email')
      .lean();

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if user can access this complaint
    const isAdminOrInspector = ['admin', 'inspector'].includes(req.user.userType);
    const isOwner = complaint.reporter && complaint.reporter._id && complaint.reporter._id.toString() === req.user._id.toString();

    if (!isOwner && !isAdminOrInspector) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: complaint
    });

  } catch (error) {
    logger.error('Get complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint'
    });
  }
};

// Assign complaint to inspector
exports.assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { inspectorId } = req.body;

    if (!inspectorId) {
      return res.status(400).json({
        success: false,
        message: 'Inspector ID is required'
      });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Verify inspector exists
    const User = require('../models/User');
    const inspector = await User.findById(inspectorId);
    if (!inspector || inspector.userType !== 'inspector') {
      return res.status(400).json({
        success: false,
        message: 'Invalid inspector ID'
      });
    }

    complaint.assignedTo = inspectorId;
    complaint.status = 'investigating';
    complaint.lastUpdated = new Date();

    await complaint.save();

    // Send real-time notifications for complaint assignment
    try {
      await notificationService.notifyComplaintAssignment(
        complaint,
        inspector,
        req.user
      );
      logger.info(`Assignment notification sent for complaint: ${complaint._id}`);
    } catch (notifError) {
      logger.error('Failed to send assignment notification:', notifError);
    }

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

// Track complaint by token (public endpoint - no auth required)
exports.trackComplaint = async (req, res) => {
  try {
    const { token } = req.params;
    const { validateTrackingToken } = require('../utils/tokenGenerator');
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Tracking token is required'
      });
    }

    // Validate token format
    if (!validateTrackingToken(token)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tracking token format'
      });
    }

    // Find complaint by any of the tracking tokens
    const complaint = await Complaint.findOne({
      $or: [
        { trackingToken: token },
        { friendlyToken: token },
        { trackingReference: token },
        { complaintId: token } // Also allow tracking by complaint ID
      ]
    }).select('-reporter -reporterEmail -reporterPhone -trackingEmail -internalNotes -timeline.actor')
      .lean();

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found with the provided tracking token'
      });
    }

    // Prepare public-safe complaint data
    const publicComplaint = {
      complaintId: complaint.complaintId,
      friendlyToken: complaint.friendlyToken,
      trackingReference: complaint.trackingReference,
      category: complaint.category,
      description: complaint.description,
      status: complaint.status,
      priority: complaint.priority,
      reportedAt: complaint.reportedAt,
      lastUpdated: complaint.updatedAt,
      
      // Location (general area only for privacy)
      location: complaint.incidentLocation ? {
        generalArea: complaint.incidentLocation.address ? 
          complaint.incidentLocation.address.split(',').slice(-2).join(',').trim() : 
          'Location provided'
      } : null,
      
      // Product info if available
      productInfo: {
        productCode: complaint.productCode,
        batchCode: complaint.batchCode,
        plantName: complaint.plantName
      },
      
      // Status timeline (public actions only)
      statusHistory: complaint.timeline ? 
        complaint.timeline
          .filter(entry => !entry.notes || !entry.notes.includes('internal'))
          .map(entry => ({
            timestamp: entry.timestamp,
            action: entry.action,
            status: entry.action.toLowerCase().includes('status') ? 
              entry.action.split(' ').pop() : undefined
          })) : [],
      
      // Assignment info (general)
      assignedTo: complaint.assignedTo ? {
        name: 'Inspector assigned',
        assigned: true
      } : null,
      
      // Resolution if available
      resolution: complaint.resolution ? {
        resolvedAt: complaint.resolution.resolvedAt,
        resolution: complaint.resolution.resolution,
        actionTaken: complaint.resolution.actionTaken
      } : null,
      
      // KEBS escalation status
      kebsEscalation: complaint.kebsEscalation?.escalated ? {
        escalated: true,
        escalatedAt: complaint.kebsEscalation.escalatedAt,
        kebsReferenceNumber: complaint.kebsEscalation.kebsReferenceNumber
      } : null,
      
      // Photo count (don't expose actual photos for privacy)
      evidenceProvided: complaint.photos ? complaint.photos.length > 0 : false,
      photoCount: complaint.photos ? complaint.photos.length : 0
    };

    res.json({
      success: true,
      message: 'Complaint tracking information',
      data: publicComplaint
    });

  } catch (error) {
    console.error('Track complaint error:', error);
    logger.error('Track complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve complaint tracking information'
    });
  }
};

// Escalate complaint to KEBS
exports.escalateToKEBS = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Align with schema kebsEscalation subdocument
    complaint.kebsEscalation = complaint.kebsEscalation || {};
    complaint.kebsEscalation.escalated = true;
    complaint.kebsEscalation.escalatedAt = new Date();
    complaint.kebsEscalation.escalatedBy = req.user._id;
    complaint.kebsEscalation.kebsResponse = '';
    complaint.kebsEscalation.kebsResponseDate = null;
    complaint.kebsEscalation.kebsReferenceNumber = '';
    complaint.status = 'escalated_kebs';
    complaint.lastUpdated = new Date();

    await complaint.save();

    // Here you would typically integrate with KEBS API
    // For now, just log the escalation
    logger.info(`Complaint ${id} escalated to KEBS`, {
      complaintId: id,
      reason,
      escalatedBy: req.user._id
    });

    res.json({
      success: true,
      message: 'Complaint escalated to KEBS successfully',
      data: complaint
    });

  } catch (error) {
    logger.error('Escalate complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to escalate complaint'
    });
  }
};