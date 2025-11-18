import User from '../models/User.js';

/**
 * Middleware to check if user has premium subscription access
 */
export const requirePremiumAccess = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        requiresAuth: true
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check and update expired subscription
    await user.deactivateExpiredSubscription();

    if (!user.hasPremiumAccess()) {
      return res.status(403).json({
        success: false,
        message: 'Premium subscription required to access this content',
        requiresPremium: true,
        subscription: {
          plan: user.subscription.plan,
          status: user.subscription.status,
          endDate: user.subscription.endDate
        }
      });
    }

    // Add subscription info to request for use in route handlers
    req.subscription = user.subscription;
    next();

  } catch (error) {
    logger.error('Premium access middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify subscription access'
    });
  }
};

/**
 * Middleware to check subscription level (basic, premium, enterprise)
 */
export const requireSubscriptionLevel = (requiredLevel) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check and update expired subscription
      await user.deactivateExpiredSubscription();

      if (!user.hasAccessLevel(requiredLevel)) {
        return res.status(403).json({
          success: false,
          message: `${requiredLevel} subscription or higher required`,
          requiresUpgrade: true,
          currentPlan: user.subscription.plan,
          requiredPlan: requiredLevel
        });
      }

      req.subscription = user.subscription;
      next();

    } catch (error) {
      logger.error('Subscription level middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify subscription level'
      });
    }
  };
};

/**
 * Middleware to add subscription info to response (non-blocking)
 */
export const addSubscriptionInfo = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        await user.deactivateExpiredSubscription();
        req.subscription = user.subscription;
      }
    }
    
    next();
  } catch (error) {
    logger.error('Subscription info middleware error:', error);
    // Non-blocking - continue without subscription info
    next();
  }
};