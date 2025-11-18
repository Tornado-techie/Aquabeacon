// server/tests/unit/report.controller.test.js

const reportController = require('../../src/controllers/report.controller');
const WaterIssue = require('../../models/WaterIssue');

jest.mock('../../models/WaterIssue');

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Report Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a report', async () => {
    WaterIssue.create.mockResolvedValue({ _id: 'id', reportedBy: 'user', title: 'Report', populate: jest.fn() });
    const req = { user: { _id: 'user' }, body: { title: 'Report', description: 'desc', issueType: 'quality', severity: 'high', location: { latitude: 1, longitude: 2 }, waterParameters: {}, affectedPeople: 1 }, files: [] };
    const res = mockResponse();
    await reportController.createReport(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('should get reports', async () => {
    WaterIssue.find.mockReturnValue({ populate: jest.fn().mockReturnThis(), sort: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue([]) });
    WaterIssue.countDocuments.mockResolvedValue(1);
    const req = { user: { _id: 'user', role: 'admin' }, query: {} };
    const res = mockResponse();
    await reportController.getReports(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('should get report by id', async () => {
    WaterIssue.findById.mockReturnValue({ populate: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue({ _id: 'id', reportedBy: { _id: 'user' }, assignedTo: {}, notes: [] }) });
    const req = { user: { _id: 'user', role: 'admin' }, params: { id: 'id' } };
    const res = mockResponse();
    await reportController.getReportById(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('should fail to get report by id if not found', async () => {
    WaterIssue.findById.mockReturnValue({ populate: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(null) });
    const req = { user: { _id: 'user', role: 'admin' }, params: { id: 'id' } };
    const res = mockResponse();
    await reportController.getReportById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  // Add similar tests for updateReport, deleteReport, getNearbyReports, updateReportStatus
});
