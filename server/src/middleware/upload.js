// middleware/upload.js - ENHANCED MULTER CONFIGURATION

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = [
  '../uploads/',
  '../uploads/reports/',
  '../uploads/complaints/',
  '../uploads/profiles/'
];

uploadDirs.forEach(dir => {
  const fullPath = path.resolve(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created upload directory: ${fullPath}`);
  }
});

// Configure storage with dynamic destination
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = '../uploads/';
    
    // Determine upload path based on route
    if (req.route && req.route.path) {
      if (req.route.path.includes('reports')) {
        uploadPath = '../uploads/reports/';
      } else if (req.route.path.includes('complaints')) {
        uploadPath = '../uploads/complaints/';
      } else if (req.route.path.includes('profile')) {
        uploadPath = '../uploads/profiles/';
      }
    }
    
    const fullPath = path.resolve(__dirname, uploadPath);
    console.log(`File upload destination: ${fullPath}`);
    cb(null, fullPath);
  },
  
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const newFilename = `${nameWithoutExt}-${uniqueSuffix}${ext}`;
    
    console.log(`Original: ${file.originalname} -> New: ${newFilename}`);
    cb(null, newFilename);
  }
});

// Enhanced file filter with detailed validation
const fileFilter = (req, file, cb) => {
  console.log(`Processing file: ${file.originalname}, MIME: ${file.mimetype}`);
  
  // Allowed file types
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedDocTypes = /pdf|doc|docx/;
  
  // Get file extension
  const extname = path.extname(file.originalname).toLowerCase();
  const extension = extname.substring(1); // Remove the dot
  
  // Check MIME type and extension
  const isValidImage = allowedImageTypes.test(extension) && file.mimetype.startsWith('image/');
  const isValidDoc = allowedDocTypes.test(extension) && (
    file.mimetype.includes('pdf') || 
    file.mimetype.includes('document') ||
    file.mimetype.includes('msword')
  );
  
  if (isValidImage || isValidDoc) {
    console.log(`✅ File accepted: ${file.originalname}`);
    return cb(null, true);
  } else {
    console.log(`❌ File rejected: ${file.originalname} (${file.mimetype})`);
    const error = new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) and documents (PDF, DOC, DOCX) are allowed');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// Create multer instance with comprehensive configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,    // 5MB per file
    files: 5,                     // Maximum 5 files
    fieldSize: 1024 * 1024,       // 1MB for field data
    fieldNameSize: 100,           // Field name limit
    fields: 20                    // Maximum number of fields
  },
  fileFilter: fileFilter
});

// Enhanced error handling middleware
const handleUploadError = (err, req, res, next) => {
  console.error('Upload error:', err);
  
  if (err instanceof multer.MulterError) {
    switch (err.code) {
    case 'LIMIT_FILE_SIZE':
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB per file.',
        code: 'FILE_TOO_LARGE'
      });
        
    case 'LIMIT_FILE_COUNT':
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed.',
        code: 'TOO_MANY_FILES'
      });
        
    case 'LIMIT_UNEXPECTED_FILE':
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field. Check your form configuration.',
        code: 'UNEXPECTED_FILE'
      });
        
    case 'LIMIT_FIELD_COUNT':
      return res.status(400).json({
        success: false,
        message: 'Too many form fields.',
        code: 'TOO_MANY_FIELDS'
      });
        
    default:
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
        code: 'UPLOAD_ERROR'
      });
    }
  }
  
  // Custom file type error
  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      message: err.message,
      code: 'INVALID_FILE_TYPE'
    });
  }
  
  // Other errors
  return res.status(500).json({
    success: false,
    message: 'Upload processing failed',
    code: 'UPLOAD_FAILED'
  });
};

// Wrapper function for better debugging
const uploadWrapper = (fieldConfig) => {
  return (req, res, next) => {
    console.log('=== FILE UPLOAD DEBUG ===');
    console.log(`Route: ${req.method} ${req.path}`);
    console.log(`Content-Type: ${req.headers['content-type']}`);
    console.log('Field config:', fieldConfig);
    
    const uploadHandler = Array.isArray(fieldConfig) 
      ? upload.array(fieldConfig[0], fieldConfig[1])
      : upload.single(fieldConfig);
    
    uploadHandler(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err);
        return handleUploadError(err, req, res, next);
      }
      
      console.log(`Files processed: ${req.files ? req.files.length : 0}`);
      console.log(`Body keys: ${Object.keys(req.body)}`);
      
      if (req.files) {
        req.files.forEach((file, index) => {
          console.log(`File ${index + 1}:`, {
            originalname: file.originalname,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype
          });
        });
      }
      
      next();
    });
  };
};

// Export configured upload instances
module.exports = {
  // Original upload for backward compatibility
  upload,
  
  // Enhanced wrappers with debugging
  uploadSingle: (fieldname) => uploadWrapper(fieldname),
  uploadArray: (fieldname, maxCount) => uploadWrapper([fieldname, maxCount]),
  uploadMultiple: upload.array.bind(upload),
  
  // Error handler
  handleUploadError,
  
  // For direct use in routes
  array: upload.array.bind(upload),
  single: upload.single.bind(upload),
  
  // Legacy export (what was being used before)
  default: upload
};

// Also export as default for require('upload')
module.exports.default = upload;