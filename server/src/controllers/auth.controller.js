// controllers/auth.controller.js
// COMPLETE FILE - COPY THIS ENTIRE FILE

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Generate Refresh Token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '90d' }
  );
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, userType } = req.body;

    logger.info(`Registration attempt for email: ${email}`);

    // Validation
    if (!firstName || !lastName || !email || !password || !phone || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
        missingFields: {
          firstName: !firstName,
          lastName: !lastName,
          email: !email,
          password: !password,
          phone: !phone,
          userType: !userType
        }
      });
    }

    // Map userType to role
    let role = 'consumer'; // default
    if (userType === 'Water Business Owner') {
      role = 'owner';
    } else if (userType === 'Inspector') {
      role = 'inspector';
    } else if (userType === 'Consumer') {
      role = 'consumer';
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      logger.warn(`Registration failed: Email ${email} already exists`);
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      phone,
      role
    });

    logger.info(`User registered successfully: ${user._id}`);

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        userType: userType, // Send back the userType based on frontend selection
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    logger.info(`Login attempt for email: ${email}`);

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user - MUST include +password to select the password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      logger.warn(`Login failed: User not found - ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    logger.info(`User ${user._id} role from DB during login: ${user.role}`);

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logger.warn(`Login failed: Invalid password - ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    logger.info(`User logged in successfully: ${user._id}`);

    // Map role to userType for frontend
    let userType = 'Consumer';
    if (user.role === 'owner') {
      userType = 'Water Business Owner';
    } else if (user.role === 'inspector') {
      userType = 'Inspector';
    } else if (user.role === 'admin') { // Added mapping for admin role
      userType = 'Admin';
    }

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        userType: userType,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    // Generate new access token
    const newToken = generateToken(decoded.id);

    res.json({
      success: true,
      token: newToken
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res) => {
  try {
    logger.info(`User logged out: ${req.user._id}`);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    logger.info(`User ${user._id} role from DB during getCurrentUser: ${user.role}`);

    // Map role to userType for frontend
    let userType = 'Consumer';
    if (user.role === 'owner') {
      userType = 'Water Business Owner';
    } else if (user.role === 'inspector') {
      userType = 'Inspector';
    } else if (user.role === 'admin') { // Added mapping for admin role
      userType = 'Admin';
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        userType: userType,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data'
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const allowedFields = [
      'firstName',
      'lastName',
      'phone',
      'businessName',
      'businessRegistration',
      'nationalId',
      'address.street',
      'address.city',
      'address.county',
      'address.postalCode',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (field.includes('.')) {
        // Handle nested fields like 'address.street'
        const [parent, child] = field.split('.');
        if (req.body[parent] && req.body[parent][child] !== undefined) {
          if (!updates[parent]) {
            updates[parent] = {};
          }
          updates[parent][child] = req.body[parent][child];
        }
      } else if (req.body[field] !== undefined) {
        // Handle top-level fields
        updates[field] = req.body[field];
      }
    }

    // Prevent changing email or role via this endpoint
    if (req.body.email) {
      return res.status(400).json({ success: false, message: 'Email cannot be changed via this endpoint.' });
    }
    if (req.body.role || req.body.userType) {
      return res.status(400).json({ success: false, message: 'Role cannot be changed via this endpoint.' });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true }).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    logger.info(`User profile updated: ${userId}`);

    // Re-map role to userType for frontend consistency
    let userType = 'Consumer';
    if (updatedUser.role === 'owner') {
      userType = 'Water Business Owner';
    } else if (updatedUser.role === 'inspector') {
      userType = 'Inspector';
    } else if (updatedUser.role === 'admin') {
      userType = 'Admin';
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        fullName: `${updatedUser.firstName} ${updatedUser.lastName}`,
        email: updatedUser.email,
        phone: updatedUser.phone,
        userType: userType,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

/**
 * @desc    Change user password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Invalid current password' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`User password changed: ${userId}`);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};