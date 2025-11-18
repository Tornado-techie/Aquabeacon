// server/tests/unit/health.controller.test.js

const healthController = require('../../src/controllers/health.controller');
const mongoose = require('mongoose');

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Health Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return basic health', () => {
    const req = {};
    const res = mockResponse();
    healthController.basicHealth(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'OK' }));
  });

  it('should return api health', async () => {
    // Use shared in-memory MongoDB setup from tests/setup.js
    // Mock connection state and db admin ping as needed
    mongoose.connection.readyState = 1;
    mongoose.connection.db = { admin: () => ({ ping: jest.fn().mockResolvedValue('pong') }) };
    const req = {};
    const res = mockResponse();
    await healthController.apiHealth(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'OK' }));
  });

  it('should return degraded health if db not connected', async () => {
    // No need to manually set connection state; handled by setup.js
    const req = {};
    const res = mockResponse();
    await healthController.apiHealth(req, res);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'DEGRADED' }));
  });

  it('should return liveness', () => {
    const req = {};
    const res = mockResponse();
    healthController.livenessProbe(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'ALIVE' }));
  });
});
