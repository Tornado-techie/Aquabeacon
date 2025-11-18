// Production M-Pesa Security Configuration
const SAFARICOM_IPS = [
  '196.201.214.200',
  '196.201.214.206', 
  '196.201.214.207',
  '196.201.214.208',
  '196.201.214.136',
  '196.201.214.137'
];

/**
 * Middleware to verify M-Pesa callback origin
 * Only allow requests from Safaricom's IP addresses in production
 */
const verifyMpesaCallback = (req, res, next) => {
  // Skip IP verification in development/sandbox
  if (process.env.MPESA_ENVIRONMENT !== 'production') {
    return next();
  }

  const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
  
  // Log the incoming IP for debugging
  console.log('M-Pesa callback received from IP:', clientIP);
  
  // Check if the IP is from Safaricom
  const isValidIP = SAFARICOM_IPS.some(validIP => 
    clientIP === validIP || clientIP.includes(validIP)
  );

  if (!isValidIP) {
    console.error('Unauthorized M-Pesa callback attempt from IP:', clientIP);
    return res.status(403).json({
      ResultCode: 1,
      ResultDesc: 'Unauthorized access'
    });
  }

  next();
};

/**
 * Enhanced logging for production M-Pesa transactions
 */
const logMpesaTransaction = (level, message, data = {}) => {
  const logData = {
    timestamp: new Date().toISOString(),
    environment: process.env.MPESA_ENVIRONMENT,
    level,
    message,
    ...data
  };

  console.log(`[MPESA-${level.toUpperCase()}]`, JSON.stringify(logData));

  // In production, you might want to send logs to external service
  if (process.env.NODE_ENV === 'production') {
    // Send to logging service like Winston, Loggly, etc.
  }
};

/**
 * Validate M-Pesa callback signature (if Safaricom provides one)
 */
const validateCallbackSignature = (req, res, next) => {
  // This is a placeholder for signature validation
  // Implement according to Safaricom's security requirements
  next();
};

module.exports = {
  verifyMpesaCallback,
  logMpesaTransaction,
  validateCallbackSignature,
  SAFARICOM_IPS
};