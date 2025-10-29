require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const connectDB = require('./config/database');
const logger = require('./utils/logger');
const { startPermitExpiryCron } = require('./src/jobs/permitExpiry.cron');

const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/users.routes');
const plantRoutes = require('./src/routes/plants.routes');
const permitRoutes = require('./src/routes/permits.routes');
const { complaintsRouter, aiRouter } = require('./src/routes/complaints.routes');
const labSampleRoutes = require('./src/routes/labSamples.routes');
const standardRoutes = require('./src/routes/standards.routes');
const trainingRoutes = require('./src/routes/training.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(helmet());
app.use(mongoSanitize());
app.use(hpp());

const corsOptions = {
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

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

const server = app.listen(PORT, () => {
  logger.info(`AquaBeacon Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (process.env.ENABLE_CRON_JOBS === 'true') {
    startPermitExpiryCron();
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