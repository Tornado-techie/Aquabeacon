// server.js
// COMPLETE FILE - COPY THIS ENTIRE FILE

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cron = require('node-cron');

const connectDB = require('./config/database');
const logger = require('./utils/logger');
const { startPermitExpiryCron } = require('./jobs/permitExpiry.cron');
const dashboardRoutes = require('./routes/dashboard.routes');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const plantRoutes = require('./routes/plants.routes');
const permitRoutes = require('./routes/permits.routes');
const { complaintsRouter, aiRouter } = require('./routes/complaints.routes');
const labSampleRoutes = require('./routes/labSamples.routes');
const standardRoutes = require('./routes/standards.routes');
const trainingRoutes = require('./routes/training.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// ============================================
// MIDDLEWARE - CORRECT ORDER (FIXED)
// ============================================

// 1. CORS - MUST BE FIRST!
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// 2. Security Headers - Configured to work with CORS
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// 3. Body Parser - BEFORE sanitization
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Sanitization - FIXED Configuration
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn(`Sanitized request data on key: ${key}`);
  }
}));

// 5. HTTP Parameter Pollution protection
app.use(hpp());

// 6. Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/permits', permitRoutes);
app.use('/api/complaints', complaintsRouter);
app.use('/api/lab-samples', labSampleRoutes);
app.use('/api/standards', standardRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/ai', aiRouter);
app.use('/api/dashboard', dashboardRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(err.status || 500).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// START SERVER
// ============================================

const server = app.listen(PORT, () => {
  logger.info(`\n✅ AquaBeacon Server running on port ${PORT}`);
  logger.info(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`✅ CORS enabled for: http://localhost:3000`);
  logger.info(`✅ API URL: http://localhost:${PORT}/api`);
  
  // Start cron jobs
  if (process.env.ENABLE_CRON_JOBS === 'true') {
    startPermitExpiryCron();
    logger.info('✅ Cron jobs started');
  }
  
  logger.info('\n📋 Auth Endpoints:');
  logger.info('   POST /api/auth/register');
  logger.info('   POST /api/auth/login');
  logger.info('   POST /api/auth/refresh');
  logger.info('   POST /api/auth/logout');
  logger.info('   GET  /api/auth/me\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;