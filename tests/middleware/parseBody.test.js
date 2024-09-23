import parseBody from '../../src/middleware/parseBody';
import { jest } from '@jest/globals';

describe('parseBody Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {'Content-Type': 'application/xml'}, // Corrected to mock req.headers
      get: jest.fn().mockReturnValue(''), // Corrected to mock req.get
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test('should correctly parse XML body to JSON', () => {
    req.get.mockReturnValue('application/xml');
    req.body = `
      <?xml version="1.0" encoding="UTF-8"?>
      <root>
        <creditCardNumber>5500 0000 0000 0004</creditCardNumber>
        <cvv2>123</cvv2>
        <email>test@example.com</email>
        <expirationDate>12/34</expirationDate>
        <mobile>08123456789</mobile>
        <phoneNumber>+2348123456789</phoneNumber>
      </root>    
    `;

    parseBody(req, res, next);

    expect(req.body).toEqual({
      creditCardNumber: '5500 0000 0000 000',
      expirationDate: '12/34',
      cvv2: '123',
      email: 'test@example.com',
      mobile: '08123456789',
      phoneNumber: '+2348123456789',
      isXml: true
    });
    expect(next).toHaveBeenCalled();
  });

  test('should return error for invalid XML structure', () => {
    req.get.mockReturnValue('application/xml');
    req.body = `
      <?xml version="1.0" encoding="UTF-8"?>
      <root>
        <creditCardNumber>5500 0000 0000 0004</creditCardNumber>
        <cvv2>123</cvv2>
      </root>
    `;

    parseBody(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid XML structure',
      message: expect.stringContaining('The following required fields are missing')
    });
  });

  test('should skip parsing if content type is not XML', () => {
    req.get.mockReturnValue('application/json');
    parseBody(req, res, next);

    expect(req.body).toEqual({});
    expect(next).toHaveBeenCalled();
  });
});