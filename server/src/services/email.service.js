const sgMail = require('@sendgrid/mail');
const logger = require('../utils/logger');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const sendEmail = async ({ to, cc, subject, text, html, attachments, template, data }) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      logger.warn('SendGrid not configured. Email not sent.');
      return { success: false, error: 'SendGrid not configured' };
    }

    const from = process.env.EMAIL_FROM || 'noreply@aquabeacon.co.ke';

    const msg = {
      to: Array.isArray(to) ? to : [to],
      from: {
        email: from,
        name: 'AquaBeacon'
      },
      subject
    };

    if (cc) {
      msg.cc = Array.isArray(cc) ? cc : [cc];
    }

    if (html) {
      msg.html = html;
    }
    if (text) {
      msg.text = text;
    }

    if (template && data) {
      msg.html = renderEmailTemplate(template, data);
      msg.text = text || data.text || '';
    }

    if (attachments && attachments.length > 0) {
      msg.attachments = attachments.map(att => ({
        content: att.content ? att.content.toString('base64') : undefined,
        filename: att.filename,
        type: att.type || 'application/pdf',
        disposition: att.disposition || 'attachment'
      }));
    }

    const response = await sgMail.send(msg);
    
    logger.info(`Email sent to ${to}: ${subject}`);
    
    return {
      success: true,
      messageId: response[0]?.headers?.['x-message-id']
    };

  } catch (error) {
    logger.error('Email send error:', error);
    
    if (error.response) {
      logger.error('SendGrid error response:', error.response.body);
    }
    
    return {
      success: false,
      error: error.message
    };
  }
};

const renderEmailTemplate = (template, data) => {
  const templates = {
    'complaint-received': `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Complaint Received</h2>
          <p>Dear ${data.reporterName},</p>
          <p>Thank you for submitting your complaint to AquaBeacon. We have received your report and it is being reviewed by our team.</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Complaint ID:</strong> ${data.complaintId}</p>
            <p><strong>Category:</strong> ${data.category}</p>
            <p><strong>Status:</strong> Received</p>
          </div>
          <p>We take all complaints seriously and will investigate this matter thoroughly. You will be notified of any updates.</p>
          <p>Best regards,<br>AquaBeacon Team</p>
        </body>
      </html>
    `,
    'permit-expiry-reminder': `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Permit Expiry Reminder</h2>
          <p>Dear ${data.ownerName},</p>
          <p>This is a reminder that your permit is expiring soon.</p>
          <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p><strong>Permit Type:</strong> ${data.permitType}</p>
            <p><strong>Permit Number:</strong> ${data.permitNumber}</p>
            <p><strong>Expiry Date:</strong> ${data.expiryDate}</p>
            <p><strong>Plant:</strong> ${data.plantName}</p>
          </div>
          <p>Please ensure you renew this permit before it expires to avoid any interruption to your operations.</p>
          <p><a href="${data.renewalLink}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Renew Permit</a></p>
          <p>Best regards,<br>AquaBeacon Team</p>
        </body>
      </html>
    `
  };

  return templates[template] || `<p>${data.text}</p>`;
};

module.exports = {
  sendEmail,
  renderEmailTemplate
};