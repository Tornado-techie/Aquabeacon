// server/tests/unit/dashboard.controller.test.js

const dashboardController = require('../../src/controllers/dashboard.controller');
const Complaint = require('../../models/Complaint');
const Plant = require('../../models/Plant');

jest.mock('../../models/User');
jest.mock('../../models/Complaint');
jest.mock('../../models/Plant');
jest.mock('../../models/Permit');

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Dashboard Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get dashboard stats for inspector', async () => {
    Complaint.countDocuments.mockResolvedValue(1);
    Complaint.find.mockReturnValue({ sort: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), populate: jest.fn().mockResolvedValue([]) });
    const req = { user: { _id: 'inspector', role: 'inspector' } };
    const res = mockResponse();
    await dashboardController.getDashboardStats(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('should get recent activities for owner', async () => {
    Plant.find.mockReturnValue({ sort: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis() });
    const req = { user: { _id: 'owner', role: 'owner' }, query: {} };
    const res = mockResponse();
    await dashboardController.getRecentActivities(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  // Add similar tests for consumer and admin roles
});
