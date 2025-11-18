const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const logger = require('../utils/logger');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.'
    });
  }
});

// Auth rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});

// Complaint rate limiter
const complaintLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many complaints submitted. Please try again later.'
  },
  skipFailedRequests: true
});

// Upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many file uploads, please try again later.'
  }
});

// AI query rate limiter
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'AI query limit reached. Please try again later.'
  }
});

// Multer configuration
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    images: /jpeg|jpg|png|gif|webp/,
    documents: /pdf|doc|docx|xls|xlsx/,
    all: /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx/
  };

  const extname = path.extname(file.originalname).toLowerCase().slice(1);
  const mimetype = file.mimetype;

  let pattern = allowedTypes.all;
  if (file.fieldname === 'photo' || file.fieldname === 'photos') {
    pattern = allowedTypes.images;
  } else if (file.fieldname === 'document' || file.fieldname === 'documents') {
    pattern = allowedTypes.documents;
  }

  const validExt = pattern.test(extname);
  const validMime = pattern.test(mimetype);

  if (validExt && validMime) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${pattern.source}`), false);
  }
};

const multerConfig = {
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10
  }
};

const upload = {
  single: (fieldName) => multer(multerConfig).single(fieldName),
  multiple: (fieldName, maxCount = 10) => multer(multerConfig).array(fieldName, maxCount),
  fields: (fields) => multer(multerConfig).fields(fields),
  any: () => multer(multerConfig).any()
};

const virusScan = async (req, res, next) => {
  if (process.env.ENABLE_VIRUS_SCAN === 'true') {
    logger.warn('Virus scanning is enabled but not implemented');
  }
  next();
};

module.exports = {
  apiLimiter,
  authLimiter,
  complaintLimiter,
  uploadLimiter,
  aiLimiter,
  upload,
  virusScan
};