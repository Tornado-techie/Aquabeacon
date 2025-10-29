// middleware/validation.js
const { body, validationResult } = require('express-validator');

// Validate report data (after multer processes files)
exports.validateReportData = (req, res, next) => {
  console.log('=== REPORT VALIDATION DEBUG ===');
  console.log('req.body:', req.body);
  console.log('req.files:', req.files?.length || 0, 'files received');

  const { title, description, issueType, severity } = req.body;
  
  // Required field validation
  const errors = [];
  
  if (!title || title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }
  
  if (!description || description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  }
  
  if (!issueType) {
    errors.push('Issue type is required');
  }
  
  if (!severity) {
    errors.push('Severity level is required');
  }

  // Location validation
  const lat = req.body['location[latitude]'];
  const lng = req.body['location[longitude]'];
  
  if (!lat || !lng) {
    errors.push('Location coordinates are required');
  }

  if (lat && (isNaN(lat) || lat < -90 || lat > 90)) {
    errors.push('Invalid latitude value');
  }

  if (lng && (isNaN(lng) || lng < -180 || lng > 180)) {
    errors.push('Invalid longitude value');
  }

  // File validation (optional but check if provided)
  if (req.files && req.files.length > 5) {
    errors.push('Maximum 5 files allowed');
  }

  if (errors.length > 0) {
    console.log('Validation errors:', errors);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  console.log('Report validation passed');
  next();
};

// Validate complaint data
exports.validateComplaintData = (req, res, next) => {
  console.log('=== COMPLAINT VALIDATION DEBUG ===');
  console.log('req.body:', req.body);
  console.log('req.files:', req.files?.length || 0, 'files received');

  const { description, category, complaintType } = req.body;
  const errors = [];

  // Required fields
  if (!description || description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  }

  // Category validation - accept either category or complaintType
  const categoryValue = category || complaintType;
  if (!categoryValue) {
    errors.push('Complaint category/type is required');
  }

  // Validate category values
  const validCategories = [
    'contamination', 'foreign_object', 'bad_taste', 'bad_smell', 
    'packaging_damage', 'health_issue', 'false_labeling', 'expired_product', 'other',
    // Also accept frontend values
    'quality', 'packaging', 'service'
  ];
  if (categoryValue && !validCategories.includes(categoryValue)) {
    errors.push('Invalid category/complaint type');
  }

  // Check if anonymous or authenticated
  const isAnonymous = req.body.isAnonymous === 'true' || req.body.isAnonymous === true;
  const isAuthenticated = !!req.user;

  // For NON-anonymous complaints (whether authenticated or not), require consumer info
  if (!isAnonymous) {
    if (!req.body.consumerName || req.body.consumerName.trim().length < 2) {
      errors.push('Consumer name is required for non-anonymous complaints');
    }
  }
  
  // Always require business name regardless of anonymous status
  if (!req.body.reportedBusinessName || req.body.reportedBusinessName.trim().length < 2) {
    errors.push('Reported business name is required');
  }

  // Location validation - handle different formats
  let lat, lng;
  
  if (req.body.location && typeof req.body.location === 'string') {
    // Handle comma-separated string format: "-1.2812288, 36.8377856"
    const coords = req.body.location.split(',');
    if (coords.length === 2) {
      lat = parseFloat(coords[0].trim());
      lng = parseFloat(coords[1].trim());
    }
  } else {
    // Handle nested field format
    lat = req.body['location[latitude]'] || req.body.latitude;
    lng = req.body['location[longitude]'] || req.body.longitude;
  }
  
  if (!lat || !lng) {
    errors.push('Location coordinates are required');
  }

  if (lat && (isNaN(lat) || lat < -90 || lat > 90)) {
    errors.push('Invalid latitude value');
  }

  if (lng && (isNaN(lng) || lng < -180 || lng > 180)) {
    errors.push('Invalid longitude value');
  }

  if (errors.length > 0) {
    console.log('Complaint validation errors:', errors);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  console.log('Complaint validation passed');
  next();
};

// Express-validator rules for registration
exports.validateRegistration = [
  body('fullName')
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters')
    .trim(),
    
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
    
  body('phoneNumber')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
    
  body('userType')
    .isIn(['Water Business Owner', 'Community Member', 'Inspector', 'Government Official'])
    .withMessage('Invalid user type'),
    
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  // Validation result handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => err.msg)
      });
    }
    next();
  }
];

// Login validation
exports.validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => err.msg)
      });
    }
    next();
  }
];

// Generic error handler for validation
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};