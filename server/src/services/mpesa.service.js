const axios = require('axios');
const moment = require('moment');

class MpesaService {
  constructor() {
    // Use production or sandbox URLs based on environment
    const isProduction = process.env.MPESA_ENVIRONMENT === 'production';
    this.baseURL = isProduction 
      ? 'https://api.safaricom.co.ke' 
      : 'https://sandbox.safaricom.co.ke';
    this.authURL = `${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`;
    this.stkPushURL = `${this.baseURL}/mpesa/stkpush/v1/processrequest`;
    this.queryURL = `${this.baseURL}/mpesa/stkpushquery/v1/query`;
    
    // Get credentials from environment variables
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.businessShortCode = process.env.MPESA_SHORTCODE;
    this.passkey = process.env.MPESA_PASSKEY;
    this.callbackURL = process.env.MPESA_CALLBACK_URL || `${process.env.MPESA_CALLBACK_BASE_URL}/api/payments/callback`;
    
    if (!this.consumerKey || !this.consumerSecret || !this.businessShortCode || !this.passkey) {
      throw new Error('Missing M-Pesa configuration. Please check environment variables.');
    }
  }

  /**
   * Generate M-Pesa access token
   */
  async generateAccessToken() {
    try {
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.get(this.authURL, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      // Log successful token generation in production
      if (process.env.NODE_ENV === 'production') {
        console.log('M-Pesa access token generated successfully', {
          environment: process.env.MPESA_ENVIRONMENT,
          timestamp: new Date().toISOString()
        });
      }

      return response.data.access_token;
    } catch (error) {
      console.error('Error generating access token:', {
        error: error.response?.data || error.message,
        environment: process.env.MPESA_ENVIRONMENT,
        timestamp: new Date().toISOString()
      });
      throw new Error('Failed to generate M-Pesa access token');
    }
  }

  /**
   * Generate password for STK push
   */
  generatePassword() {
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = Buffer.from(`${this.businessShortCode}${this.passkey}${timestamp}`).toString('base64');
    return { password, timestamp };
  }

  /**
   * Initiate STK Push payment
   * @param {Object} paymentData - Payment information
   * @param {string} paymentData.phoneNumber - Customer phone number (254XXXXXXXXX)
   * @param {number} paymentData.amount - Amount to be paid
   * @param {string} paymentData.accountReference - Account reference (e.g., permit ID, subscription ID)
   * @param {string} paymentData.transactionDesc - Transaction description
   */
  async initiateSTKPush(paymentData) {
    try {
      const { phoneNumber, amount, accountReference, transactionDesc } = paymentData;
      
      // Validate phone number format
      if (!phoneNumber.match(/^254[0-9]{9}$/)) {
        throw new Error('Invalid phone number format. Use 254XXXXXXXXX');
      }

      // Get access token
      const accessToken = await this.generateAccessToken();
      
      // Generate password and timestamp
      const { password, timestamp } = this.generatePassword();

      const stkPushData = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.floor(amount), // Ensure amount is integer
        PartyA: phoneNumber,
        PartyB: this.businessShortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: this.callbackURL,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc
      };

      const response = await axios.post(this.stkPushURL, stkPushData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        checkoutRequestID: response.data.CheckoutRequestID,
        merchantRequestID: response.data.MerchantRequestID,
        customerMessage: response.data.CustomerMessage,
        responseCode: response.data.ResponseCode,
        responseDescription: response.data.ResponseDescription
      };

    } catch (error) {
      console.error('STK Push Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.errorMessage || 'Failed to initiate payment');
    }
  }

  /**
   * Query STK Push transaction status
   * @param {string} checkoutRequestID - Checkout request ID from STK push response
   */
  async queryTransaction(checkoutRequestID) {
    try {
      const accessToken = await this.generateAccessToken();
      const { password, timestamp } = this.generatePassword();

      const queryData = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID
      };

      const response = await axios.post(this.queryURL, queryData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        responseCode: response.data.ResponseCode,
        responseDescription: response.data.ResponseDescription,
        merchantRequestID: response.data.MerchantRequestID,
        checkoutRequestID: response.data.CheckoutRequestID,
        resultCode: response.data.ResultCode,
        resultDesc: response.data.ResultDesc
      };

    } catch (error) {
      console.error('Query Transaction Error:', error.response?.data || error.message);
      throw new Error('Failed to query transaction status');
    }
  }

  /**
   * Process M-Pesa callback response
   * @param {Object} callbackData - Callback data from M-Pesa
   */
  processCallback(callbackData) {
    try {
      const { Body } = callbackData;
      const { stkCallback } = Body;
      
      const result = {
        merchantRequestID: stkCallback.MerchantRequestID,
        checkoutRequestID: stkCallback.CheckoutRequestID,
        resultCode: stkCallback.ResultCode,
        resultDesc: stkCallback.ResultDesc
      };

      // If payment was successful, extract transaction details
      if (stkCallback.ResultCode === 0) {
        const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];
        
        const getMetadataValue = (name) => {
          const item = callbackMetadata.find(item => item.Name === name);
          return item ? item.Value : null;
        };

        result.transactionDetails = {
          amount: getMetadataValue('Amount'),
          mpesaReceiptNumber: getMetadataValue('MpesaReceiptNumber'),
          transactionDate: getMetadataValue('TransactionDate'),
          phoneNumber: getMetadataValue('PhoneNumber'),
          balance: getMetadataValue('Balance')
        };
      }

      return result;
    } catch (error) {
      console.error('Error processing callback:', error);
      throw new Error('Failed to process M-Pesa callback');
    }
  }

  /**
   * Format phone number to M-Pesa format (254XXXXXXXXX)
   * @param {string} phoneNumber - Phone number in various formats
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digits
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Handle different formats
    if (digits.startsWith('254')) {
      return digits;
    } else if (digits.startsWith('0')) {
      return `254${digits.substring(1)}`;
    } else if (digits.startsWith('7') || digits.startsWith('1')) {
      return `254${digits}`;
    }
    
    throw new Error('Invalid phone number format');
  }

  /**
   * Validate payment amount
   * @param {number} amount - Amount to validate
   */
  validateAmount(amount) {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 1 || numAmount > 70000) {
      throw new Error('Amount must be between KSH 1 and KSH 70,000');
    }
    return Math.floor(numAmount);
  }
}

module.exports = MpesaService;