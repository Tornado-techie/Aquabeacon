// server/tests/unit/complaints.controller.test.js

const complaintsController = require('../../src/controllers/complaints.controller');
const Complaint = require('../../models/Complaint');

jest.mock('../../models/Complaint');
jest.mock('../../models/User');
jest.mock('../../services/notification.service');

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Complaints Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should submit complaint', async () => {
    Complaint.create.mockResolvedValue({ _id: 'id', complaintId: 'cid', category: 'quality', status: 'received', reportedAt: new Date(), photos: [], incidentLocation: { address: 'addr' }, isAnonymous: false, trackingToken: 'token', friendlyToken: 'ftoken', trackingReference: 'ref' });
    const req = { body: { description: 'desc', category: 'quality', location: '1,2', complaintType: 'quality', consumerName: 'John', consumerEmail: 'john@example.com', consumerPhone: '+254700000000', reportedBusinessName: 'Biz', productCode: 'P001', batchCode: 'B001' }, files: [], user: { _id: 'user', fullName: 'John', email: 'john@example.com', phoneNumber: '+254700000000' } };
    const res = mockResponse();
    await complaintsController.submitComplaint(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('should fail if location is missing', async () => {
    const req = { body: { description: 'desc', category: 'quality', complaintType: 'quality' }, files: [], user: { _id: 'user' } };
    const res = mockResponse();
    await complaintsController.submitComplaint(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  // Add similar tests for getUserComplaints, updateComplaintStatus, getComplaints, getComplaint, assignComplaint, trackComplaint, escalateToKEBS
});
