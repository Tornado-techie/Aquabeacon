const MpesaService = require('../services/mpesa.service.js');
const Payment = require('../../models/Payment.js');
const User = require('../../models/User.js');
const Plant = require('../../models/Plant.js');
const { validationResult } = require('express-validator');

class PaymentController {
  /**
   * Get MpesaService instance
   * @private
   */
  static getMpesaService() {
    return new MpesaService();
  }

  /**
   * Initiate STK Push payment
   */
  static async initiatePayment(req, res) {
    try {
      const mpesaService = PaymentController.getMpesaService();
      
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const {
        phoneNumber,
        amount,
        paymentType,
        relatedEntityId,
        description,
        accountReference
      } = req.body;

      const userId = req.user._id;

      // Validate user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Format and validate phone number
      let formattedPhone;
      try {
        formattedPhone = mpesaService.formatPhoneNumber(phoneNumber);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      // Validate amount
      let validatedAmount;
      try {
        validatedAmount = mpesaService.validateAmount(amount);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      // Check for existing pending payments
      const existingPayment = await Payment.findActivePayments(userId);
      if (existingPayment.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'You have a pending payment. Please complete or cancel it before initiating a new one.',
          existingPayment: existingPayment[0]
        });
      }

      // Create payment record
      const payment = new Payment({
        user: userId,
        type: paymentType,
        amount: validatedAmount,
        phoneNumber: formattedPhone,
        description,
        accountReference: accountReference || `PAY-${Date.now()}`,
        relatedEntity: relatedEntityId ? {
          entityType: paymentType === 'permit_fee' ? 'Plant' : 'Subscription',
          entityId: relatedEntityId
        } : undefined,
        metadata: {
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip,
          source: 'web'
        }
      });

      await payment.save();

      // Initiate STK Push
      const stkResponse = await mpesaService.initiateSTKPush({
        phoneNumber: formattedPhone,
        amount: validatedAmount,
        accountReference: payment.accountReference,
        transactionDesc: description
      });

      // Update payment with M-Pesa response
      payment.mpesa = {
        merchantRequestID: stkResponse.merchantRequestID,
        checkoutRequestID: stkResponse.checkoutRequestID
      };
      payment.status = 'processing';
      await payment.save();

      res.status(200).json({
        success: true,
        message: 'Payment initiated successfully. Please check your phone for M-Pesa prompt.',
        data: {
          paymentId: payment._id,
          checkoutRequestID: stkResponse.checkoutRequestID,
          customerMessage: stkResponse.customerMessage,
          amount: validatedAmount,
          phoneNumber: formattedPhone
        }
      });

    } catch (error) {
      console.error('Payment initiation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to initiate payment',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Handle M-Pesa callback
   */
  static async handleCallback(req, res) {
    try {
      const mpesaService = PaymentController.getMpesaService();
      console.log('M-Pesa Callback received:', JSON.stringify(req.body, null, 2));

      const callbackData = mpesaService.processCallback(req.body);
      
      // Find payment by checkout request ID
      const payment = await Payment.findOne({
        'mpesa.checkoutRequestID': callbackData.checkoutRequestID
      }).populate('user', 'email profile.firstName profile.lastName');

      if (!payment) {
        console.error('Payment not found for checkout request:', callbackData.checkoutRequestID);
        return res.status(404).json({
          ResultCode: 1,
          ResultDesc: 'Payment record not found'
        });
      }

      // Update payment record
      payment.callbackReceived = true;
      payment.callbackData = req.body;
      payment.mpesa.resultCode = callbackData.resultCode;
      payment.mpesa.resultDesc = callbackData.resultDesc;

      if (callbackData.resultCode === 0) {
        // Payment successful
        payment.status = 'completed';
        payment.completedAt = new Date();
        
        if (callbackData.transactionDetails) {
          payment.mpesa = {
            ...payment.mpesa,
            ...callbackData.transactionDetails
          };
        }

        // Process post-payment actions based on payment type
        await PaymentController.processPostPaymentActions(payment);

        console.log(`Payment ${payment._id} completed successfully`);
      } else {
        // Payment failed
        payment.status = 'failed';
        console.log(`Payment ${payment._id} failed: ${callbackData.resultDesc}`);
      }

      await payment.save();

      // Send success response to M-Pesa
      res.status(200).json({
        ResultCode: 0,
        ResultDesc: 'Callback received successfully'
      });

    } catch (error) {
      console.error('Callback processing error:', error);
      res.status(500).json({
        ResultCode: 1,
        ResultDesc: 'Callback processing failed'
      });
    }
  }

  /**
   * Query payment status
   */
  static async checkPaymentStatus(req, res) {
    try {
      const mpesaService = PaymentController.getMpesaService();
      const { paymentId } = req.params;
      const userId = req.user._id;

      const payment = await Payment.findOne({
        _id: paymentId,
        user: userId
      }).populate('user', 'email profile');

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      // If payment is still processing and not expired, query M-Pesa
      if (payment.status === 'processing' && !payment.isExpired()) {
        try {
          const queryResult = await mpesaService.queryTransaction(
            payment.mpesa.checkoutRequestID
          );

          // Update payment status based on query result
          if (queryResult.resultCode === 0) {
            payment.status = 'completed';
            payment.completedAt = new Date();
            await payment.save();
            await PaymentController.processPostPaymentActions(payment);
          } else if (queryResult.resultCode !== '1032') { // 1032 means still processing
            payment.status = 'failed';
            payment.mpesa.resultDesc = queryResult.resultDesc;
            await payment.save();
          }
        } catch (queryError) {
          console.error('Error querying transaction status:', queryError);
        }
      }

      // Mark as expired if past expiry time
      if (payment.isExpired() && payment.status === 'processing') {
        payment.status = 'expired';
        await payment.save();
      }

      res.status(200).json({
        success: true,
        data: {
          paymentId: payment._id,
          status: payment.status,
          amount: payment.amount,
          formattedAmount: payment.formattedAmount,
          phoneNumber: payment.phoneNumber,
          description: payment.description,
          initiatedAt: payment.initiatedAt,
          completedAt: payment.completedAt,
          expiresAt: payment.expiresAt,
          mpesaReceiptNumber: payment.mpesa?.mpesaReceiptNumber,
          isExpired: payment.isExpired()
        }
      });

    } catch (error) {
      console.error('Payment status check error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check payment status',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Get user payment history
   */
  static async getPaymentHistory(req, res) {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 10, status, type } = req.query;

      const query = { user: userId };
      if (status) query.status = status;
      if (type) query.type = type;

      const payments = await Payment.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('relatedEntity.entityId')
        .exec();

      const total = await Payment.countDocuments(query);

      res.status(200).json({
        success: true,
        data: {
          payments,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalRecords: total,
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Payment history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment history'
      });
    }
  }

  /**
   * Cancel pending payment
   */
  static async cancelPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const userId = req.user._id;

      const payment = await Payment.findOne({
        _id: paymentId,
        user: userId,
        status: { $in: ['pending', 'processing'] }
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found or cannot be cancelled'
        });
      }

      payment.status = 'cancelled';
      await payment.save();

      res.status(200).json({
        success: true,
        message: 'Payment cancelled successfully',
        data: { paymentId: payment._id }
      });

    } catch (error) {
      console.error('Payment cancellation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel payment'
      });
    }
  }

  /**
   * Process actions after successful payment
   */
  static async processPostPaymentActions(payment) {
    try {
      switch (payment.type) {
      case 'permit_fee':
        await PaymentController.activatePermit(payment);
        break;
      case 'subscription':
        await PaymentController.updateSubscription(payment);
        break;
      case 'inspection_fee':
        await PaymentController.scheduleInspection(payment);
        break;
      default:
        console.log(`No post-payment action defined for type: ${payment.type}`);
      }
    } catch (error) {
      console.error('Error processing post-payment actions:', error);
    }
  }

  /**
   * Activate permit after payment
   */
  static async activatePermit(payment) {
    if (payment.relatedEntity?.entityId) {
      const plant = await Plant.findById(payment.relatedEntity.entityId);
      if (plant) {
        plant.status = 'active';
        await plant.save();
        console.log(`Plant ${plant._id} activated after payment ${payment._id}`);
      }
    }
  }

  /**
   * Update user subscription after payment
   */
  static async updateSubscription(payment) {
    const user = await User.findById(payment.user);
    if (user) {
      const plan = PaymentController.getSubscriptionPlan(payment.amount);
      const durationDays = 30; // Fixed 30-day subscription period
      
      // Update user subscription
      await user.activateSubscription(plan, durationDays);
      
      // Update payment record with subscription details
      payment.subscription = {
        startDate: user.subscription.startDate,
        endDate: user.subscription.endDate,
        plan: plan,
        reminderSent: false,
        renewalAttempted: false
      };
      
      await payment.save();
      
      console.log(`Subscription activated for user ${user._id}: ${plan} plan until ${user.subscription.endDate}`);
      
      // Send confirmation email
      await PaymentController.sendSubscriptionConfirmationEmail(user, payment);
    }
  }

  /**
   * Schedule inspection after payment
   */
  static async scheduleInspection(payment) {
    // Implementation for scheduling inspection
    console.log(`Inspection scheduled for payment ${payment._id}`);
  }

  /**
   * Helper functions for subscription management
   */
  static getSubscriptionDuration(amount) {
    if (amount >= 5000) return 12; // Annual
    if (amount >= 1500) return 3;  // Quarterly
    return 1; // Monthly
  }

  static getSubscriptionPlan(amount) {
    if (amount >= 10000) return 'enterprise';
    if (amount >= 5000) return 'premium';
    if (amount >= 1500) return 'basic';
    return 'basic';
  }

  /**
   * Send subscription confirmation email
   */
  static async sendSubscriptionConfirmationEmail(user, payment) {
    try {
      // Import email service (assuming you have one)
      // const emailService = require('../services/email.service');
      
      const emailData = {
        to: user.email,
        subject: 'Subscription Activated - AquaBeacon',
        template: 'subscription-confirmation',
        data: {
          userName: `${user.profile.firstName} ${user.profile.lastName}`,
          plan: payment.subscription.plan,
          amount: payment.amount,
          startDate: payment.subscription.startDate.toLocaleDateString(),
          endDate: payment.subscription.endDate.toLocaleDateString(),
          receiptNumber: payment.mpesa?.mpesaReceiptNumber
        }
      };
      
      // await emailService.sendEmail(emailData);
      console.log(`Subscription confirmation email queued for ${user.email}`);
      
    } catch (error) {
      console.error('Failed to send subscription confirmation email:', error);
    }
  }

  /**
   * Check user subscription access
   */
  static async checkSubscriptionAccess(req, res) {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check and update expired subscription
      await user.deactivateExpiredSubscription();

      const hasAccess = user.hasPremiumAccess();
      const isExpiringSoon = user.isSubscriptionExpiringSoon();

      res.status(200).json({
        success: true,
        data: {
          hasAccess,
          isExpiringSoon,
          subscription: {
            plan: user.subscription.plan,
            status: user.subscription.status,
            startDate: user.subscription.startDate,
            endDate: user.subscription.endDate,
            daysRemaining: hasAccess ? 
              Math.ceil((user.subscription.endDate - new Date()) / (1000 * 60 * 60 * 24)) : 0
          }
        }
      });

    } catch (error) {
      console.error('Error checking subscription access:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check subscription access'
      });
    }
  }
}

module.exports = {
  initiatePayment: PaymentController.initiatePayment,
  handleCallback: PaymentController.handleCallback,
  checkPaymentStatus: PaymentController.checkPaymentStatus,
  getPaymentHistory: PaymentController.getPaymentHistory,
  cancelPayment: PaymentController.cancelPayment,
  checkSubscriptionAccess: PaymentController.checkSubscriptionAccess
};