// server/tests/unit/inspector.controller.test.js

const inspectorController = require('../../src/controllers/inspector.controller');
const Complaint = require('../../models/Complaint');
const User = require('../../models/User');

jest.mock('../../models/Complaint');
jest.mock('../../models/User');

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Inspector Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get complaints for inspector', async () => {
    Complaint.find.mockReturnValue({ populate: jest.fn().mockReturnThis(), sort: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue([]) });
    Complaint.countDocuments.mockResolvedValue(1);
    const req = { user: { _id: 'inspector', role: 'inspector' }, query: {} };
    const res = mockResponse();
    await inspectorController.getComplaintsForInspector(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('should assign complaint', async () => {
    Complaint.findById.mockResolvedValue({ save: jest.fn().mockResolvedValue(), timeline: [], status: 'received' });
    User.findById.mockResolvedValue({ role: 'inspector' });
    const req = { user: { _id: 'admin', role: 'admin' }, params: { id: 'cid' }, body: { inspectorId: 'inspector', notes: 'note' } };
    const res = mockResponse();
    await inspectorController.assignComplaint(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  // Add similar tests for updateComplaintStatus, scheduleVisit, sendEmailToCompany, addVisitReport, getInspectorStats, getInspectors
});
