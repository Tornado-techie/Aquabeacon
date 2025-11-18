const express = require('express');
const { body } = require('express-validator');
const {
  initiatePayment,
  handleCallback,
  checkPaymentStatus,
  getPaymentHistory,
  cancelPayment,
  checkSubscriptionAccess
} = require('../src/controllers/payment.controller.js');
const { authenticate } = require('../src/middleware/auth.middleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for payment endpoints
const paymentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 payment requests per windowMs
  message: {
    success: false,
    message: 'Too many payment attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Validation rules
const paymentValidation = [
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^(\+254|254|0)?[17]\d{8}$/)
    .withMessage('Invalid phone number format. Use 07XXXXXXXX or 01XXXXXXXX'),
  
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 1, max: 70000 })
    .withMessage('Amount must be between KSH 1 and KSH 70,000'),
  
  body('paymentType')
    .isIn(['permit_fee', 'subscription', 'inspection_fee', 'lab_test', 'other'])
    .withMessage('Invalid payment type'),
  
  body('description')
    .notEmpty()
    .withMessage('Payment description is required')
    .isLength({ min: 10, max: 200 })
    .withMessage('Description must be between 10 and 200 characters'),
  
  body('accountReference')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('Account reference must be between 3 and 50 characters')
];

/**
 * @route   POST /api/payments/initiate
 * @desc    Initiate STK Push payment
 * @access  Private
 * @body    {phoneNumber, amount, paymentType, description, accountReference?, relatedEntityId?}
 */
router.post('/initiate', 
  paymentRateLimit,
  authenticate,
  paymentValidation,
  initiatePayment
);

/**
 * @route   POST /api/payments/callback
 * @desc    Handle M-Pesa callback (webhook)
 * @access  Public (M-Pesa servers)
 * @note    This endpoint should be whitelisted for M-Pesa IPs in production
 */
const { verifyMpesaCallback } = require('../src/middleware/mpesa.middleware');
router.post('/callback', verifyMpesaCallback, handleCallback);

/**
 * @route   GET /api/payments/:paymentId/status
 * @desc    Check payment status
 * @access  Private
 */
router.get('/:paymentId/status', authenticate, checkPaymentStatus);

/**
 * @route   GET /api/payments/history
 * @desc    Get user payment history
 * @access  Private
 * @query   {page?, limit?, status?, type?}
 */
router.get('/history', authenticate, getPaymentHistory);

/**
 * @route   PUT /api/payments/:paymentId/cancel
 * @desc    Cancel pending payment
 * @access  Private
 */
router.put('/:paymentId/cancel', authenticate, cancelPayment);

/**
 * @route   GET /api/payments/subscription/access
 * @desc    Check user subscription access and status
 * @access  Private
 */
router.get('/subscription/access', authenticate, checkSubscriptionAccess);

/**
 * @route   GET /api/payments/test-connection
 * @desc    Test M-Pesa API connection (development only)
 * @access  Private (Admin only)
 */
router.get('/test-connection', authenticate, async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, message: 'Not found' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin role required.' 
    });
  }

  try {
    const MpesaService = require('../src/services/mpesa.service.js');
    const mpesaService = new MpesaService();
    const token = await mpesaService.generateAccessToken();
    
    res.status(200).json({
      success: true,
      message: 'M-Pesa connection successful',
      data: {
        tokenGenerated: !!token,
        environment: process.env.NODE_ENV,
        shortcode: process.env.MPESA_SHORTCODE
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'M-Pesa connection failed',
      error: error.message
    });
  }
});

module.exports = router;