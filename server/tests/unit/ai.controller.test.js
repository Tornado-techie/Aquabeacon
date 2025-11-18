// server/tests/unit/ai.controller.test.js

const aiController = require('../../src/controllers/ai.controller');
const aiService = require('../../services/ai.service');

jest.mock('../../services/ai.service');

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('AI Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process valid AI query', async () => {
    aiService.validateQuery.mockReturnValue({ isValid: true, errors: [] });
    aiService.isWaterRelated.mockReturnValue(true);
    aiService.generateResponse.mockResolvedValue('response');
    const req = { body: { query: 'Is water safe?' } };
    const res = mockResponse();
    await aiController.processQuery(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('should reject invalid query', async () => {
    aiService.validateQuery.mockReturnValue({ isValid: false, errors: ['Invalid'] });
    const req = { body: { query: '' } };
    const res = mockResponse();
    await aiController.processQuery(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('should reject non-water-related query', async () => {
    aiService.validateQuery.mockReturnValue({ isValid: true, errors: [] });
    aiService.isWaterRelated.mockReturnValue(false);
    const req = { body: { query: 'Unrelated question' } };
    const res = mockResponse();
    await aiController.processQuery(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('should handle errors in processQuery', async () => {
    aiService.validateQuery.mockImplementation(() => { throw new Error('fail'); });
    const req = { body: { query: 'fail' } };
    const res = mockResponse();
    await aiController.processQuery(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('should get chat history', async () => {
    const req = { params: { sessionId: 'abc' } };
    const res = mockResponse();
    await aiController.getChatHistory(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('should clear chat session', async () => {
    const req = { params: { sessionId: 'abc' } };
    const res = mockResponse();
    await aiController.clearChatSession(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('should get chat stats', async () => {
    const req = {};
    const res = mockResponse();
    await aiController.getChatStats(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('should get suggested questions', async () => {
    aiService.getSuggestedQuestions.mockReturnValue(['Q1', 'Q2']);
    const req = {};
    const res = mockResponse();
    await aiController.getSuggestedQuestions(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});
