// src/api/controllers/card.controller.test.js

import { validatePayment } from '../../../src/api/controllers/card.controller';
import utils from '../../../utils';
import services from '../../../src/services';

const { utilityResponse } = utils;
const { cardIssuer, cvv2Validator, emailValidator, expiryDateValidator, lunhValidator, phoneNumberValidator } = services;

jest.mock('../../../utils', () => ({
  utilityResponse: jest.fn(),
  errorCodesGenerator: jest.fn()
}));

jest.mock('../../../src/services', () => ({
  cardIssuer: jest.fn(),
  cvv2Validator: jest.fn(),
  emailValidator: jest.fn(),
  expiryDateValidator: jest.fn(),
  lunhValidator: jest.fn(),
  phoneNumberValidator: jest.fn()
}));

describe('validatePayment Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {
        creditCardNumber: '4111111111111111',
        expirationDate: '12/25',
        cvv2: '123',
        email: 'test@example.com',
        mobile: '08123456789',
        phoneNumber: '+2348123456789',
        isXml: false
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      set: jest.fn(),
      send: jest.fn()
    };
    next = jest.fn();

    // Mocking service functions
    lunhValidator.mockReturnValue(true);
    cardIssuer.mockReturnValue('visa');
    expiryDateValidator.mockReturnValue([true]);
    emailValidator.mockReturnValue(true);
    cvv2Validator.mockReturnValue(true);
    phoneNumberValidator.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should validate and return 200 for valid card details', () => {
    const errorCodes = [];
    utils.errorCodesGenerator.mockReturnValue(errorCodes);

    validatePayment(req, res, next);

    expect(utils.errorCodesGenerator).toHaveBeenCalledWith({
      isCard: true,
      issuer: 'visa',
      hasExpired: [true],
      validEmail: true,
      validCvv: true,
      validPhoneNumber: true
    });

    expect(utilityResponse).toHaveBeenCalledWith({
      errorCodes,
      data: { issuer: 'visa' },
      res,
      isXml: false
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('should return 400 if card details are invalid', () => {
    lunhValidator.mockReturnValue(false); // Invalid card number
    const errorCodes = ['creditCardNumber: The card number is invalid'];
    utils.errorCodesGenerator.mockReturnValue(errorCodes);

    validatePayment(req, res, next);

    expect(utils.errorCodesGenerator).toHaveBeenCalledWith({
      isCard: false,
      issuer: 'visa',
      hasExpired: [true],
      validEmail: true,
      validCvv: true,
      validPhoneNumber: true
    });

    expect(utilityResponse).toHaveBeenCalledWith({
      errorCodes,
      data: { issuer: 'visa' },
      res,
      isXml: false
    });

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('should handle unexpected errors', () => {
    const mockError = new Error('Unexpected Error');
    utils.errorCodesGenerator.mockImplementation(() => {
      throw mockError;
    });

    validatePayment(req, res, next);

    expect(utilityResponse).toHaveBeenCalledWith({
      errorCodes: mockError.message,
      res,
      statusCode: 500
    });

    expect(res.status).toHaveBeenCalledWith(500);
  });
});