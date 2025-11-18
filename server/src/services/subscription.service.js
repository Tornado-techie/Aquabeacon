const cron = require('node-cron');
const User = require('../../models/User.js');
const Payment = require('../../models/Payment.js');

class SubscriptionService {
  /**
   * Initialize subscription management cron jobs
   */
  static initializeSubscriptionJobs() {
    // Check for expiring subscriptions daily at 9 AM
    cron.schedule('0 9 * * *', async () => {
      console.log('Running subscription expiry reminder job...');
      await SubscriptionService.sendExpiryReminders();
    });

    // Deactivate expired subscriptions daily at 12 AM
    cron.schedule('0 0 * * *', async () => {
      console.log('Running subscription expiry deactivation job...');
      await SubscriptionService.deactivateExpiredSubscriptions();
    });

    console.log('Subscription management cron jobs initialized');
  }

  /**
   * Send email reminders for subscriptions expiring in 7 days
   */
  static async sendExpiryReminders() {
    try {
      const expiringPayments = await Payment.findExpiringSubscriptions();
      
      console.log(`Found ${expiringPayments.length} subscriptions expiring soon`);

      for (const payment of expiringPayments) {
        await SubscriptionService.sendExpiryReminderEmail(payment);
        
        // Mark reminder as sent
        payment.subscription.reminderSent = true;
        await payment.save();
      }

      return { 
        success: true, 
        remindersSent: expiringPayments.length 
      };

    } catch (error) {
      console.error('Error sending subscription expiry reminders:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Deactivate subscriptions that have expired
   */
  static async deactivateExpiredSubscriptions() {
    try {
      const expiredUsers = await User.find({
        'subscription.status': 'active',
        'subscription.endDate': { $lt: new Date() }
      });

      console.log(`Found ${expiredUsers.length} expired subscriptions to deactivate`);

      let deactivatedCount = 0;
      for (const user of expiredUsers) {
        await user.deactivateExpiredSubscription();
        await SubscriptionService.sendSubscriptionExpiredEmail(user);
        deactivatedCount++;
      }

      return { 
        success: true, 
        deactivatedCount 
      };

    } catch (error) {
      console.error('Error deactivating expired subscriptions:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Send subscription expiry reminder email
   */
  static async sendExpiryReminderEmail(payment) {
    try {
      const user = payment.user;
      const daysUntilExpiry = Math.ceil(
        (payment.subscription.endDate - new Date()) / (1000 * 60 * 60 * 24)
      );

      const emailData = {
        to: user.email,
        subject: `Your AquaBeacon subscription expires in ${daysUntilExpiry} days`,
        template: 'subscription-expiry-reminder',
        data: {
          userName: `${user.profile.firstName} ${user.profile.lastName}`,
          plan: payment.subscription.plan,
          expiryDate: payment.subscription.endDate.toLocaleDateString(),
          daysUntilExpiry,
          renewalUrl: `${process.env.FRONTEND_URL}/pricing?renewal=true`,
          loginUrl: `${process.env.FRONTEND_URL}/signin`
        }
      };

      // For now, just log the email (replace with actual email service)
      console.log(`Expiry reminder email queued for ${user.email}:`, {
        subject: emailData.subject,
        expiryDate: emailData.data.expiryDate,
        daysUntilExpiry
      });

      // TODO: Implement actual email sending
      // await emailService.sendEmail(emailData);

      return { success: true };

    } catch (error) {
      console.error('Failed to send expiry reminder email:', error);
      throw error;
    }
  }

  /**
   * Send subscription expired email
   */
  static async sendSubscriptionExpiredEmail(user) {
    try {
      const emailData = {
        to: user.email,
        subject: 'Your AquaBeacon subscription has expired',
        template: 'subscription-expired',
        data: {
          userName: `${user.profile.firstName} ${user.profile.lastName}`,
          expiredDate: user.subscription.endDate.toLocaleDateString(),
          renewalUrl: `${process.env.FRONTEND_URL}/pricing?renewal=true`,
          loginUrl: `${process.env.FRONTEND_URL}/signin`
        }
      };

      console.log(`Subscription expired email queued for ${user.email}:`, {
        subject: emailData.subject,
        expiredDate: emailData.data.expiredDate
      });

      // TODO: Implement actual email sending
      // await emailService.sendEmail(emailData);

      return { success: true };

    } catch (error) {
      console.error('Failed to send subscription expired email:', error);
      throw error;
    }
  }

  /**
   * Get subscription statistics for admin dashboard
   */
  static async getSubscriptionStats() {
    try {
      const stats = await User.aggregate([
        {
          $group: {
            _id: '$subscription.status',
            count: { $sum: 1 }
          }
        }
      ]);

      const planStats = await User.aggregate([
        {
          $match: { 'subscription.status': 'active' }
        },
        {
          $group: {
            _id: '$subscription.plan',
            count: { $sum: 1 }
          }
        }
      ]);

      const expiringCount = await User.countDocuments({
        'subscription.status': 'active',
        'subscription.endDate': {
          $gte: new Date(),
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        }
      });

      return {
        subscriptionStatus: stats,
        activePlans: planStats,
        expiringSoon: expiringCount
      };

    } catch (error) {
      console.error('Error getting subscription statistics:', error);
      throw error;
    }
  }

  /**
   * Manually trigger subscription check for a specific user
   */
  static async checkUserSubscription(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const wasActive = user.hasPremiumAccess();
      await user.deactivateExpiredSubscription();
      const isActiveNow = user.hasPremiumAccess();

      return {
        userId,
        wasActive,
        isActiveNow,
        subscription: user.subscription,
        statusChanged: wasActive !== isActiveNow
      };

    } catch (error) {
      console.error('Error checking user subscription:', error);
      throw error;
    }
  }
}

module.exports = { SubscriptionService };