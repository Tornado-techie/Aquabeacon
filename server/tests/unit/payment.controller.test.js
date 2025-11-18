// server/tests/unit/payment.controller.test.js

const paymentController = require('../../src/controllers/payment.controller');
const Payment = require('../../models/Payment');
const MpesaService = require('../../services/mpesa.service.js');

jest.mock('../../models/Payment');
jest.mock('../../models/User');
jest.mock('../../models/Plant');
jest.mock('../../services/mpesa.service.js');

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Payment Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initiate payment', async () => {
    User.findById.mockResolvedValue({ _id: 'user' });
    Payment.findActivePayments.mockResolvedValue([]);
    Payment.prototype.save = jest.fn().mockResolvedValue();
    MpesaService.prototype.formatPhoneNumber.mockReturnValue('+254700000000');
    MpesaService.prototype.validateAmount.mockReturnValue(1000);
    MpesaService.prototype.initiateSTKPush.mockResolvedValue({ merchantRequestID: 'mid', checkoutRequestID: 'cid', customerMessage: 'msg' });
    const req = { user: { _id: 'user' }, body: { phoneNumber: '+254700000000', amount: 1000, paymentType: 'permit_fee', description: 'desc' } };
    const res = mockResponse();
    await paymentController.initiatePayment(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('should fail if user not found', async () => {
    User.findById.mockResolvedValue(null);
    const req = { user: { _id: 'user' }, body: { phoneNumber: '+254700000000', amount: 1000, paymentType: 'permit_fee', description: 'desc' } };
    const res = mockResponse();
    await paymentController.initiatePayment(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  // Add similar tests for handleCallback, checkPaymentStatus, getPaymentHistory, cancelPayment, checkSubscriptionAccess
});
