// routes/auth.routes.js
// COMPLETE FILE - COPY THIS ENTIRE FILE

const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth.middleware');
const { handleValidationErrors } = require('../middleware/validator.middleware');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// Registration validation - matches frontend format
const registerValidation = [
  /*
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
    // .isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
    // .isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  
  body('email')
    .notEmpty()
    .withMessage('Email is required'),
    // .isEmail().normalizeEmail().withMessage('Valid email is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
    // .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  body('phone') 
    .notEmpty()
    .withMessage('Phone number is required'),
    // .matches(/^\\+?[\\d\\s-()]+$/).withMessage('Valid phone number is required'),
  
  body('userType')
    .notEmpty()
    .withMessage('User type is required'),
    // .isIn(['Water Business Owner', 'Inspector', 'Consumer']).withMessage('Invalid user type. Must be: Water Business Owner, Inspector, or Consumer')
  */
];

// Profile update validation
const profileUpdateValidation = [
  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('phone').optional().matches(/^\+?[\d\s-()]+$/).withMessage('Valid phone number is required'),
  body('businessName').optional().trim().notEmpty().withMessage('Business name cannot be empty'),
  body('businessRegistration').optional().trim().notEmpty().withMessage('Business registration cannot be empty'),
  body('nationalId').optional().trim().notEmpty().withMessage('National ID cannot be empty'),
  body('address.street').optional().trim().notEmpty().withMessage('Street cannot be empty'),
  body('address.city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('address.county').optional().trim().notEmpty().withMessage('County cannot be empty'),
  body('address.postalCode').optional().trim().notEmpty().withMessage('Postal code cannot be empty')
];

// Login validation
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Password change validation
const passwordChangeValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':",.<>/?]).{6,}$/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('confirmNewPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('New password and confirm password do not match');
    }
    return true;
  })
];

// Routes
router.post('/register', registerValidation, handleValidationErrors, authController.register);
router.post('/login', loginValidation, handleValidationErrors, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);
router.put('/profile', authenticate, profileUpdateValidation, handleValidationErrors, authController.updateProfile);
router.put('/change-password', authenticate, passwordChangeValidation, handleValidationErrors, authController.changePassword);

module.exports = router;