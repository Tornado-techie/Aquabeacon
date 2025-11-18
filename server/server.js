const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

// Database connection
const connectDB = require('./src/config/database');
const logger = require('./utils/logger');
const { startPermitExpiryCron } = require('./src/jobs/permitExpiry.cron');
const { SubscriptionService } = require('./src/services/subscription.service');

const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/users.routes');
const plantRoutes = require('./src/routes/plants.routes');
const permitRoutes = require('./src/routes/permits.routes');
const { complaintsRouter } = require('./src/routes/complaints.routes');
const aiRouter = require('./src/routes/ai.routes');
const labSampleRoutes = require('./src/routes/labSamples.routes');
const standardRoutes = require('./src/routes/standards.routes');
const healthRoutes = require('./src/routes/health.routes');
const trainingRoutes = require('./src/routes/training.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const reportsRoutes = require('./src/routes/reports.routes');
const articlesRoutes = require('./src/routes/articles.routes');
const inspectorRoutes = require('./src/routes/inspector.routes');
const monitoringRoutes = require('./src/routes/monitoring.routes');
const paymentRoutes = require('./routes/payments');

const app = express();

// Increase server timeout to prevent premature disconnections
const server = http.createServer(app);
server.timeout = 120000; // 120 seconds (2 minutes)
server.keepAliveTimeout = 65000; // 65 seconds
server.headersTimeout = 66000; // 66 seconds

const PORT = process.env.PORT || 5000;

connectDB();

// Make io available to routes (placeholder for future implementation)
app.set('io', null);

app.use(helmet());
app.use(mongoSanitize());
app.use(hpp());

const corsOptions = {
  origin: function (origin, callback) {
    // Define allowed origins
    const allowedOrigins = [
      'https://tornado-techie.github.io',
      'https://aquabeacon-client.vercel.app',
      'https://aquabeacon-client-hrb49xvuu-tornado-techies-projects.vercel.app',
      'http://localhost:5173', // Vite dev server default port
      'http://localhost:5174', // Vite dev server alternate port
      'http://localhost:3000' // React dev server
    ];
    
    // Add production frontend URL if it exists (remove trailing slash)
    if (process.env.FRONTEND_URL) {
      const cleanUrl = process.env.FRONTEND_URL.replace(/\/$/, '');
      allowedOrigins.push(cleanUrl);
      allowedOrigins.push(process.env.FRONTEND_URL); // Also add original with slash just in case
    }
    
    // Allow all Vercel preview deployments (*.vercel.app)
    const isVercelDomain = origin && origin.match(/https:\/\/.*\.vercel\.app$/);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow if in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ CORS allowed (development mode): ${origin}`);
      return callback(null, true);
    }
    
    // Allow any localhost origin in development-like environments
    const isLocalhost = origin && origin.match(/^http:\/\/localhost:\d+$/);
    
    if (allowedOrigins.indexOf(origin) !== -1 || isVercelDomain || isLocalhost) {
      console.log(`✅ CORS allowed origin: ${origin}`);
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Performance monitoring middleware
const performanceMonitor = require('./src/services/performance.service');
app.use(performanceMonitor.middleware());

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check routes
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes); // Also mount at /api/health for consistency

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
app.use('/api/reports', reportsRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/inspector', inspectorRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/payments', paymentRoutes);

// Serve uploaded files (for development when S3 is not configured)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  logger.error('Error:', err);
  
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(err.status || 500).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

server.listen(PORT, () => {
  logger.info(`AquaBeacon Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (process.env.ENABLE_CRON_JOBS === 'true') {
    startPermitExpiryCron();
    SubscriptionService.initializeSubscriptionJobs();
    logger.info('Cron jobs started');
  }
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;