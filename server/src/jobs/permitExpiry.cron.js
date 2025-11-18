const cron = require('node-cron');
const Permit = require('../models/Permit');
const Plant = require('../models/Plant');
// const User = require('../models/User'); // Unused for now
const { sendEmail } = require('../services/email.service');
const { sendSMS } = require('../services/sms.service');
const logger = require('../utils/logger');

const checkExpiringPermits = async () => {
  try {
    logger.info('Running permit expiry check...');

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const thirtyOneDaysFromNow = new Date();
    thirtyOneDaysFromNow.setDate(thirtyOneDaysFromNow.getDate() + 31);

    const expiringPermits = await Permit.find({
      status: { $in: ['approved', 'renewed'] },
      expiryDate: {
        $gte: thirtyDaysFromNow,
        $lte: thirtyOneDaysFromNow
      }
    }).populate('plant');

    logger.info(`Found ${expiringPermits.length} permits expiring in 30 days`);

    for (const permit of expiringPermits) {
      try {
        if (!permit.plant) continue;

        const plant = await Plant.findById(permit.plant._id).populate('owner');
        if (!plant || !plant.owner) continue;

        const owner = plant.owner;

        const emailSent = await sendEmail({
          to: owner.email,
          subject: `Permit Expiry Reminder - ${permit.permitType}`,
          template: 'permit-expiry-reminder',
          data: {
            ownerName: owner.fullName,
            permitType: permit.permitType.replace('_', ' ').toUpperCase(),
            permitNumber: permit.permitNumber || 'N/A',
            expiryDate: permit.expiryDate.toLocaleDateString(),
            plantName: plant.name,
            renewalLink: `${process.env.FRONTEND_URL}/permits/${permit._id}/renew`
          }
        });

        if (owner.isPhoneVerified) {
          await sendSMS({
            to: owner.phone,
            message: `AquaBeacon: Your ${permit.permitType} permit for ${plant.name} expires on ${permit.expiryDate.toLocaleDateString()}. Please renew soon.`
          });
        }

        permit.renewalReminders.push({
          sentAt: new Date(),
          method: emailSent.success ? 'both' : 'sms',
          status: 'sent'
        });
        await permit.save();

        logger.info(`Reminder sent for permit ${permit._id} to ${owner.email}`);

      } catch (error) {
        logger.error(`Failed to send reminder for permit ${permit._id}:`, error);
      }
    }

    logger.info('Permit expiry check completed');

  } catch (error) {
    logger.error('Permit expiry check error:', error);
  }
};

const updateExpiredPermits = async () => {
  try {
    logger.info('Updating expired permits...');

    const result = await Permit.updateMany(
      {
        status: { $in: ['approved', 'renewed'] },
        expiryDate: { $lt: new Date() }
      },
      {
        $set: { status: 'expired' }
      }
    );

    logger.info(`Updated ${result.modifiedCount} expired permits`);

  } catch (error) {
    logger.error('Update expired permits error:', error);
  }
};

const startPermitExpiryCron = () => {
  cron.schedule('0 9 * * *', checkExpiringPermits, {
    timezone: 'Africa/Nairobi'
  });

  cron.schedule('0 1 * * *', updateExpiredPermits, {
    timezone: 'Africa/Nairobi'
  });

  logger.info('Permit expiry cron jobs scheduled');
};

module.exports = {
  startPermitExpiryCron,
  checkExpiringPermits,
  updateExpiredPermits
};