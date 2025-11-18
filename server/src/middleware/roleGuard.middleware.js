const roleGuard = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

const ownerOrRole = (allowedRoles, ownerField = 'owner') => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    if (req.resource && req.resource[ownerField]) {
      if (req.resource[ownerField].toString() === req.user._id.toString()) {
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access this resource'
    });
  };
};

const consultantOrOwner = () => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    if (!req.resource) {
      return res.status(403).json({
        success: false,
        message: 'Resource not found'
      });
    }

    if (req.resource.owner && req.resource.owner.toString() === req.user._id.toString()) {
      return next();
    }

    if (req.resource.consultant && req.resource.consultant.toString() === req.user._id.toString()) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access this resource'
    });
  };
};

const adminOnly = roleGuard(['admin']);
const inspectorOrAdmin = roleGuard(['inspector', 'admin']);
const ownerOrAdmin = roleGuard(['owner', 'admin']);

module.exports = {
  roleGuard,
  ownerOrRole,
  consultantOrOwner,
  adminOnly,
  inspectorOrAdmin,
  ownerOrAdmin
};