// Testable Express app (without server.listen)
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const mongoose = require('mongoose');

// Import middleware
const authMiddleware = require('./middleware/auth');
const validationMiddleware = require('./middleware/validation');

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./routes/users');
const plantRoutes = require('./routes/plants');
const complaintRoutes = require('./routes/complaints');
const permitRoutes = require('./routes/permits');
const paymentRoutes = require('./routes/payments');
const articleRoutes = require('./routes/articles');
const aiRoutes = require('./routes/ai');
const uploadRoutes = require('./routes/upload');
const labRoutes = require('./routes/labs');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.CLIENT_URL] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 100, // Higher limit for tests
  message: {
    error: 'Too many requests from this IP, please try again later.',
    resetTime: 15
  }
});
app.use('/api/', limiter);

// Compression and parsing
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
  
  res.status(dbState === 1 ? 200 : 503).json({
    status: dbState === 1 ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/permits', permitRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/labs', labRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;