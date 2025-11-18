// server/tests/unit/analytics.controller.test.js

const analyticsController = require('../../src/controllers/analytics.controller');
const AIChatHistory = require('../../models/AIChatHistory');
const User = require('../../models/User');
const Complaint = require('../../models/Complaint');
const Plant = require('../../models/Plant');

jest.mock('../../models/AIChatHistory');
jest.mock('../../models/User');
jest.mock('../../models/Complaint');
jest.mock('../../models/Plant');

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Analytics Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAIAnalytics', () => {
    it('should deny access for non-admin', async () => {
      const req = { user: { role: 'consumer' } };
      const res = mockResponse();
      await analyticsController.getAIAnalytics(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('should return analytics for admin', async () => {
      AIChatHistory.countDocuments.mockResolvedValue(10);
      AIChatHistory.aggregate.mockResolvedValue([{ totalQueries: 5 }]);
      AIChatHistory.find.mockResolvedValue([{ metadata: { totalMessages: 3 } }]);
      AIChatHistory.aggregate.mockResolvedValueOnce([{ topic: 'water', count: 2 }]);
      AIChatHistory.aggregate.mockResolvedValueOnce([{ _id: 'admin', count: 1 }]);
      analyticsController.__getDailyUsageStats = jest.fn().mockResolvedValue([]);
      const req = { user: { role: 'admin' } };
      const res = mockResponse();
      await analyticsController.getAIAnalytics(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  describe('getSystemAnalytics', () => {
    it('should deny access for non-admin', async () => {
      const req = { user: { role: 'consumer' } };
      const res = mockResponse();
      await analyticsController.getSystemAnalytics(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('should return system analytics for admin', async () => {
      User.aggregate.mockResolvedValue([]);
      Complaint.aggregate.mockResolvedValue([]);
      Plant.aggregate.mockResolvedValue([]);
      AIChatHistory.aggregate.mockResolvedValue([]);
      const req = { user: { role: 'admin' } };
      const res = mockResponse();
      await analyticsController.getSystemAnalytics(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });
});
