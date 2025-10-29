const Complaint = require('../models/Complaint');
const Plant = require('../models/Plant');
const logger = require('../utils/logger');
const { escalateToKEBS } = require('../services/kebs.service');
const { sendEmail } = require('../services/email.service');
const { uploadToS3, generateFileKey } = require('../services/s3.service'); // Added S3 imports

exports.submitComplaint = async (req, res) => {
  try {
    console.log('=== COMPLAINT SUBMISSION DEBUG ===');
    console.log('req.body:', JSON.stringify(req.body, null, 2));
    console.log('req.files:', req.files ? req.files.map(f => ({name: f.originalname, size: f.size})) : 'none');
    console.log('req.body.isAnonymous type:', typeof req.body.isAnonymous, 'value:', req.body.isAnonymous);
    
    const {
      consumerName,
      consumerEmail,
      consumerPhone,
      reportedBusinessName,
      productCode,
      batchCode,
      complaintType,
      description,
      location,
      isAnonymous // Destructure isAnonymous
    } = req.body;

    // Remove JSON parsing for incidentLocation as it's now a string directly from frontend
    // The frontend sends `location` as a string, no need for JSON.parse
    // const parsedHealthImpact = healthImpact ? JSON.parse(healthImpact) : undefined;
    // const parsedIncidentLocation = incidentLocation ? JSON.parse(incidentLocation) : undefined;

    // Ensure symptoms is an array for healthImpact (if still used - seems not from frontend)
    // if (parsedHealthImpact && typeof parsedHealthImpact.symptoms === 'string') {
    //   parsedHealthImpact.symptoms = parsedHealthImpact.symptoms.split(',').map(s => s.trim()).filter(s => s.length > 0);
    // } else if (parsedHealthImpact && !Array.isArray(parsedHealthImpact.symptoms)) {
    //   parsedHealthImpact.symptoms = [];
    // }

    const complaintData = {
      reporter: req.user?._id || null,
      reporterName: isAnonymous ? null : consumerName,
      reporterEmail: isAnonymous ? null : consumerEmail,
      reporterPhone: isAnonymous ? null : consumerPhone,
      isAnonymous: isAnonymous || false, // Use the destructured isAnonymous
      plantName: reportedBusinessName,
      batchCode,
      productCode,
      // productName: productName, // Frontend doesn't send this directly now
      // purchaseDate: purchaseDate,
      // purchaseLocation: purchaseLocation,
      category: complaintType,
      description,
      reportedAt: new Date(), // Explicitly set the reported date
      // healthImpact: parsedHealthImpact,
      incidentLocation: location, // Directly use location string
      status: 'received',
    };

    // Handle photo uploads if any
    if (req.files && req.files.length > 0) {
      const photoUploadPromises = req.files.map(async (file) => {
        const key = generateFileKey('complaints/photos', file.originalname);
        const url = await uploadToS3(file.buffer, key, file.mimetype);
        return { url, s3Key: key, originalName: file.originalname, size: file.size };
      });
      complaintData.photos = await Promise.all(photoUploadPromises);
    }

    const complaint = await Complaint.create(complaintData);

    if (productCode) {
      const plant = await Plant.findOne({
        'productCodes.code': productCode
      });
      if (plant) {
        complaint.plant = plant._id;
        await complaint.save();
        
        plant.metrics.complaintCount += 1;
        await plant.save();
      }
    }

    logger.info(`New complaint submitted: ${complaint._id}`);

    // Only send email if not anonymous and email is provided
    if (!complaintData.isAnonymous && complaintData.reporterEmail) {
      try {
        await sendEmail({
          to: complaintData.reporterEmail,
          subject: 'Complaint Received - AquaBeacon',
          template: 'complaint-received',
          data: {
            reporterName: complaintData.reporterName,
            complaintId: complaint._id,
            category: complaintData.category
          }
        });
      } catch (emailError) {
        logger.error('Failed to send confirmation email:', emailError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: {
        complaint: {
          id: complaint._id,
          status: complaint.status,
          category: complaint.category,
          reportedAt: complaint.reportedAt,
          createdAt: complaint.createdAt
        }
      }
    });

  } catch (error) {
    logger.error('Submit complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit complaint',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      category,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    // Log query parameters for debugging
    logger.info('Get complaints query:', { status, priority, category, startDate, endDate, page, limit, userRole: req.user.role });

    const filter = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        try {
          filter.createdAt.$gte = new Date(startDate);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: 'Invalid startDate format'
          });
        }
      }
      if (endDate) {
        try {
          filter.createdAt.$lte = new Date(endDate);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: 'Invalid endDate format'
          });
        }
      }
    }

    if (req.user.role === 'owner') {
      const plants = await Plant.find({ owner: req.user._id }).select('_id');
      filter.plant = { $in: plants.map(p => p._id) };
    }

    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    
    if (isNaN(parsedPage) || parsedPage < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page number'
      });
    }
    
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid limit (must be between 1 and 100)'
      });
    }

    const complaints = await Complaint.find(filter)
      .populate('plant', 'name registrationNumber')
      .populate('assignedTo', 'firstName lastName')
      .sort({ reportedAt: -1, createdAt: -1 })
      .limit(parsedLimit)
      .skip((parsedPage - 1) * parsedLimit);

    const total = await Complaint.countDocuments(filter);

    res.json({
      success: true,
      data: {
        complaints,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total,
          pages: Math.ceil(total / parsedLimit)
        }
      }
    });

  } catch (error) {
    logger.error('Get complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve complaints',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('plant')
      .populate('reporter', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('labSample');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    if (req.user.role === 'owner') {
      const plant = await Plant.findOne({ 
        _id: complaint.plant,
        owner: req.user._id 
      });
      
      if (!plant) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      data: { complaint }
    });

  } catch (error) {
    logger.error('Get complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve complaint'
    });
  }
};

exports.updateComplaint = async (req, res) => {
  try {
    const { status, resolution, internalNote } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    if (status) {
      complaint.status = status;
    }

    if (resolution) {
      complaint.resolution = {
        ...complaint.resolution,
        ...resolution,
        resolvedAt: new Date(),
        resolvedBy: req.user._id
      };
    }

    if (internalNote) {
      complaint.internalNotes.push({
        note: internalNote,
        addedBy: req.user._id
      });
    }

    await complaint.save();

    logger.info(`Complaint updated: ${complaint._id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      data: { complaint }
    });

  } catch (error) {
    logger.error('Update complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint'
    });
  }
};

exports.assignComplaint = async (req, res) => {
  try {
    const { inspectorId } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo: inspectorId,
        assignedAt: new Date(),
        $push: {
          timeline: {
            action: 'Complaint assigned',
            actor: req.user._id,
            notes: `Assigned to inspector`
          }
        }
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      message: 'Complaint assigned successfully',
      data: { complaint }
    });

  } catch (error) {
    logger.error('Assign complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign complaint'
    });
  }
};

exports.escalateToKEBS = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('plant')
      .populate('labSample');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    if (complaint.kebsEscalation.escalated) {
      return res.status(400).json({
        success: false,
        message: 'Complaint already escalated to KEBS'
      });
    }

    const result = await escalateToKEBS(complaint);

    complaint.kebsEscalation = {
      escalated: true,
      escalatedAt: new Date(),
      escalatedBy: req.user._id,
      emailSent: result.emailSent,
      emailSentAt: result.emailSent ? new Date() : null,
      pdfUrl: result.pdfUrl
    };
    
    complaint.status = 'escalated_kebs';
    
    complaint.timeline.push({
      action: 'Escalated to KEBS',
      actor: req.user._id,
      notes: 'Complaint escalated to Kenya Bureau of Standards'
    });

    await complaint.save();

    logger.info(`Complaint escalated to KEBS: ${complaint._id}`);

    res.json({
      success: true,
      message: 'Complaint escalated to KEBS successfully',
      data: {
        complaint,
        escalation: result
      }
    });

  } catch (error) {
    logger.error('KEBS escalation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to escalate complaint to KEBS',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  submitComplaint: exports.submitComplaint,
  getComplaints: exports.getComplaints,
  getComplaint: exports.getComplaint,
  updateComplaint: exports.updateComplaint,
  assignComplaint: exports.assignComplaint,
  escalateToKEBS: exports.escalateToKEBS
};