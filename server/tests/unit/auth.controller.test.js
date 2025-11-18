// Unit tests for auth.controller.js
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../../server');
const User = require('../../models/User');
const authController = require('../../src/controllers/auth.controller');

jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe('Auth Controller', () => {
  let testUser;

  beforeAll(async () => {
    // Use shared in-memory MongoDB setup from tests/setup.js
    testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      password: 'password123',
      phone: '+254700000000',
      role: 'consumer'
    });
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const req = {
        body: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
          phone: '+254700000001',
          userType: 'Consumer'
        }
      };
      const res = mockResponse();
      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should fail if required fields are missing', async () => {
      const req = { body: {} };
      const res = mockResponse();
      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('should fail if email already exists', async () => {
      await User.create({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'password123',
        phone: '+254700000002',
        role: 'consumer'
      });
      const req = {
        body: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          password: 'password123',
          phone: '+254700000002',
          userType: 'Consumer'
        }
      };
      const res = mockResponse();
      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('should fail if admin registration code is missing for admin', async () => {
      process.env.ADMIN_REGISTRATION_CODE = 'admin123';
      const req = {
        body: {
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          password: 'password123',
          phone: '+254700000009',
          userType: 'Administrator',
          role: 'admin'
        }
      };
      const res = mockResponse();
      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('should fail if admin registration code is invalid', async () => {
      process.env.ADMIN_REGISTRATION_CODE = 'admin123';
      const req = {
        body: {
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          password: 'password123',
          phone: '+254700000009',
          userType: 'Administrator',
          role: 'admin',
          adminCode: 'wrongcode'
        }
      };
      const res = mockResponse();
      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('should register admin with valid code', async () => {
      process.env.ADMIN_REGISTRATION_CODE = 'admin123';
      const req = {
        body: {
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin2@example.com',
          password: 'password123',
          phone: '+254700000010',
          userType: 'Administrator',
          role: 'admin',
          adminCode: 'admin123'
        }
      };
      const res = mockResponse();
      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'testlogin@example.com',
        password: 'password123',
        phone: '+254700000003',
        role: 'consumer'
      });
      const req = {
        body: {
          email: 'testlogin@example.com',
          password: 'password123'
        }
      };
      const res = mockResponse();
      await authController.login(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should fail with invalid credentials', async () => {
      const req = {
        body: {
          email: 'wrong@example.com',
          password: 'wrongpassword'
        }
      };
      const res = mockResponse();
      await authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('should fail if email or password is missing', async () => {
      const req = { body: { email: '', password: '' } };
      const res = mockResponse();
      await authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
  });

  describe('refresh', () => {
    it('should refresh token with valid refresh token', async () => {
      const req = { body: { refreshToken } };
      const res = mockResponse();
      await authController.refresh(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should fail with invalid refresh token', async () => {
      const req = { body: { refreshToken: 'invalidtoken' } };
      const res = mockResponse();
      await authController.refresh(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('should fail if refresh token is missing', async () => {
      const req = { body: {} };
      const res = mockResponse();
      await authController.refresh(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const req = { user: { _id: testUser._id } };
      const res = mockResponse();
      await authController.logout(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const user = await User.create({
        firstName: 'Current',
        lastName: 'User',
        email: 'current@example.com',
        password: 'password123',
        phone: '+254700000004',
        role: 'consumer'
      });
      const req = { user: { _id: user._id } };
      const res = mockResponse();
      await authController.getCurrentUser(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should fail if user not found', async () => {
      const req = { user: { _id: mongoose.Types.ObjectId() } };
      const res = mockResponse();
      await authController.getCurrentUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const user = await User.create({
        firstName: 'Update',
        lastName: 'Profile',
        email: 'update@example.com',
        password: 'password123',
        phone: '+254700000005',
        role: 'consumer'
      });
      const req = {
        user: { _id: user._id },
        body: { firstName: 'Updated', lastName: 'Profile' }
      };
      const res = mockResponse();
      await authController.updateProfile(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should fail if email is changed', async () => {
      const user = await User.create({
        firstName: 'Update',
        lastName: 'Profile',
        email: 'updatefail@example.com',
        password: 'password123',
        phone: '+254700000006',
        role: 'consumer'
      });
      const req = {
        user: { _id: user._id },
        body: { email: 'newemail@example.com' }
      };
      const res = mockResponse();
      await authController.updateProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
  });

  describe('changePassword', () => {
    it('should change password with valid current password', async () => {
      const user = await User.create({
        firstName: 'Change',
        lastName: 'Password',
        email: 'changepass@example.com',
        password: 'oldpassword',
        phone: '+254700000007',
        role: 'consumer'
      });
      const req = {
        user: { _id: user._id },
        body: { currentPassword: 'oldpassword', newPassword: 'newpassword123' }
      };
      const res = mockResponse();
      await authController.changePassword(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should fail with invalid current password', async () => {
      const user = await User.create({
        firstName: 'Change',
        lastName: 'Password',
        email: 'changepassfail@example.com',
        password: 'oldpassword',
        phone: '+254700000008',
        role: 'consumer'
      });
      const req = {
        user: { _id: user._id },
        body: { currentPassword: 'wrongpassword', newPassword: 'newpassword123' }
      };
      const res = mockResponse();
      await authController.changePassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
  });
});

// Helper to mock Express response
function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}
