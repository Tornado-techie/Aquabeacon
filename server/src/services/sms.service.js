const twilio = require('twilio');
const logger = require('../utils/logger');

let twilioClient = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

const sendSMS = async ({ to, message }) => {
  try {
    if (!twilioClient) {
      logger.warn('Twilio not configured. SMS not sent.');
      return { success: false, error: 'Twilio not configured' };
    }

    const from = process.env.TWILIO_PHONE_NUMBER;

    if (!from) {
      logger.error('Twilio phone number not configured');
      return { success: false, error: 'Twilio phone number not configured' };
    }

    const formattedTo = to.startsWith('+') ? to : `+254${to.replace(/^0/, '')}`;

    const response = await twilioClient.messages.create({
      body: message,
      from,
      to: formattedTo
    });

    logger.info(`SMS sent to ${formattedTo}`);

    return {
      success: true,
      messageId: response.sid
    };

  } catch (error) {
    logger.error('SMS send error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const sendBulkSMS = async (messages) => {
  const results = [];
  
  for (const msg of messages) {
    const result = await sendSMS(msg);
    results.push({ ...msg, ...result });
  }
  
  return results;
};

module.exports = {
  sendSMS,
  sendBulkSMS
};