// Enhanced upload middleware with proper debugging and error handling
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Ensure upload directories exist
const createUploadDirectories = () => {
  const uploadDirs = [
    'uploads',
    'uploads/complaints',
    'uploads/reports', 
    'uploads/profiles',
    'uploads/plants',
    'uploads/permits',
    'uploads/temp'
  ];

  uploadDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      logger.info(`Created upload directory: ${fullPath}`);
    }
  });
};

// Initialize upload directories
createUploadDirectories();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('=== MULTER DESTINATION DEBUG ===');
    console.log('Route path:', req.route?.path);
    console.log('File fieldname:', file.fieldname);
    console.log('File originalname:', file.originalname);

    let uploadPath = 'uploads/temp'; // default

    // Determine upload path based on route or field name
    if (req.route?.path.includes('complaints') || file.fieldname === 'complaint-photos' || file.fieldname === 'photos') {
      uploadPath = 'uploads/complaints';
    } else if (req.route?.path.includes('reports') || file.fieldname === 'photos') {
      uploadPath = 'uploads/reports';
    } else if (req.route?.path.includes('profile') || file.fieldname === 'profilePhoto') {
      uploadPath = 'uploads/profiles';
    } else if (req.route?.path.includes('plants') || file.fieldname === 'plantPhotos') {
      uploadPath = 'uploads/plants';
    } else if (req.route?.path.includes('permits') || file.fieldname === 'permitDocs') {
      uploadPath = 'uploads/permits';
    }

    console.log('Determined upload path:', uploadPath);

    // Calculate absolute path for multer and ensure directory exists
    const fullPath = path.join(process.cwd(), '..', uploadPath);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log('Created directory:', fullPath);
    }

    // Return absolute path to multer
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    console.log('=== MULTER FILENAME DEBUG ===');
    console.log('Original filename:', file.originalname);
    
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    const newFilename = `${baseName}_${uniqueSuffix}${ext}`;
    
    console.log('Generated filename:', newFilename);
    cb(null, newFilename);
  }
});

// File filter with enhanced validation
const fileFilter = (req, file, cb) => {
  console.log('=== MULTER FILE FILTER DEBUG ===');
  console.log('File details:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });

  // Define allowed file types
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  let allowedTypes = [...allowedImageTypes, ...allowedDocTypes];

  // Restrict based on field name
  if (file.fieldname === 'photos' || file.fieldname === 'complaint-photos' || file.fieldname === 'profilePhoto') {
    allowedTypes = allowedImageTypes;
  } else if (file.fieldname === 'permitDocs') {
    allowedTypes = allowedDocTypes;
  }

  // Check file extension
  const fileExt = path.extname(file.originalname).toLowerCase();
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx'];
  
  const isValidExtension = validExtensions.includes(fileExt);
  const isValidMimeType = allowedTypes.includes(file.mimetype);

  console.log('File validation:', {
    extension: fileExt,
    mimetype: file.mimetype,
    isValidExtension,
    isValidMimeType,
    allowedTypes
  });

  if (isValidExtension && isValidMimeType) {
    console.log('✅ File accepted:', file.originalname);
    cb(null, true);
  } else {
    console.log('❌ File rejected:', file.originalname);
    const error = new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// Multer configuration
const multerConfig = {
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10, // Max 10 files per request
    fields: 20, // Max 20 non-file fields
    parts: 30 // Max 30 parts total
  }
};

// Enhanced multer instance with better error handling
const upload = multer(multerConfig);

// Custom middleware for upload debugging
const uploadDebugger = (fieldName, maxCount = 1, isArray = false) => {
  return (req, res, next) => {
    console.log('=== FILE UPLOAD DEBUG START ===');
    console.log('Route:', req.method, req.path);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Content-Length:', req.headers['content-length']);
    console.log('Field name:', fieldName);
    console.log('Max count:', maxCount);
    console.log('Is array:', isArray);
    console.log('Request body keys:', Object.keys(req.body || {}));
    
    // Choose appropriate multer method
    let multerHandler;
    if (isArray) {
      multerHandler = upload.array(fieldName, maxCount);
    } else if (maxCount === 1) {
      multerHandler = upload.single(fieldName);
    } else {
      multerHandler = upload.array(fieldName, maxCount);
    }

    // Execute multer with enhanced error handling
    multerHandler(req, res, (err) => {
      console.log('=== POST-MULTER DEBUG ===');
      console.log('Multer error:', err);
      console.log('req.files:', req.files ? req.files.length : 'undefined');
      console.log('req.file:', req.file ? req.file.filename : 'undefined');
      console.log('req.body keys after multer:', Object.keys(req.body || {}));
      
      if (req.files) {
        console.log('Files processed:', req.files.map(f => ({
          fieldname: f.fieldname,
          originalname: f.originalname,
          filename: f.filename,
          size: f.size,
          mimetype: f.mimetype,
          path: f.path
        })));
      }

      if (err) {
        console.error('=== MULTER ERROR ===');
        console.error('Error details:', err);

        // Handle specific multer errors
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size too large. Maximum size is 10MB per file.',
            error: 'FILE_TOO_LARGE'
          });
        }

        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: `Too many files. Maximum is ${maxCount} files.`,
            error: 'TOO_MANY_FILES'
          });
        }

        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: `Unexpected field name. Expected: ${fieldName}`,
            error: 'UNEXPECTED_FIELD'
          });
        }

        if (err.code === 'INVALID_FILE_TYPE') {
          return res.status(400).json({
            success: false,
            message: err.message,
            error: 'INVALID_FILE_TYPE'
          });
        }

        // Generic multer error
        return res.status(400).json({
          success: false,
          message: 'File upload failed',
          error: err.message
        });
      }

      console.log('✅ File upload successful');
      console.log('=== FILE UPLOAD DEBUG END ===');
      next();
    });
  };
};

// Export upload functions
module.exports = {
  // Standard multer instance
  upload,
  
  // Enhanced upload with debugging
  uploadSingle: (fieldName) => uploadDebugger(fieldName, 1, false),
  uploadArray: (fieldName, maxCount = 5) => uploadDebugger(fieldName, maxCount, true),
  uploadFields: (fields) => upload.fields(fields),
  uploadAny: () => upload.any(),
  
  // Utility functions
  createUploadDirectories,
  
  // File validation middleware (use after multer)
  validateFiles: (options = {}) => {
    const {
      required = true,
      minFiles = 1,
      maxFiles = 10,
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    } = options;

    return (req, res, next) => {
      console.log('=== FILE VALIDATION DEBUG ===');
      console.log('Files to validate:', req.files ? req.files.length : 0);
      console.log('Validation options:', { required, minFiles, maxFiles, allowedTypes });

      // Check if files are required
      if (required && (!req.files || req.files.length === 0)) {
        return res.status(400).json({
          success: false,
          message: 'At least one file is required',
          error: 'NO_FILES_UPLOADED'
        });
      }

      // Skip validation if no files and not required
      if (!req.files || req.files.length === 0) {
        console.log('No files to validate, skipping...');
        return next();
      }

      // Check file count
      if (req.files.length < minFiles) {
        return res.status(400).json({
          success: false,
          message: `At least ${minFiles} file(s) required`,
          error: 'INSUFFICIENT_FILES'
        });
      }

      if (req.files.length > maxFiles) {
        return res.status(400).json({
          success: false,
          message: `Maximum ${maxFiles} files allowed`,
          error: 'TOO_MANY_FILES'
        });
      }

      // Validate file types
      const invalidFiles = req.files.filter(file => !allowedTypes.includes(file.mimetype));
      if (invalidFiles.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file type detected',
          error: 'INVALID_FILE_TYPE',
          invalidFiles: invalidFiles.map(f => f.originalname)
        });
      }

      console.log('✅ All files validated successfully');
      next();
    };
  }
};