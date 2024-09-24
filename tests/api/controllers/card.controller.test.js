// card.controller.test.js
import { validateCard } from '../../../src/api/controllers/card.controller';
import utils from '../../../src/utils';
import services from '../../../src/api/services';

jest.mock('../../../src/utils');
jest.mock('../../../src/api/services');

describe('validateCard', () => {
  let req, res;

  beforeEach(() => {
      req = {
          body: {
              creditCardNumber: '4111 1111 1111 1111',
              expirationDate: '12/23',
              cvv2: '123',
              email: 'test@example.com',
              phoneNumber: '1234567890',
              isXml: false
          }
      };
      res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          send: jest.fn()
      };

      services.lunhValidator.mockReturnValue(true);
      services.cardIssuer.mockReturnValue('VISA');
      services.expiryDateValidator.mockReturnValue(false);
      services.emailValidator.mockReturnValue(true);
      services.cvv2Validator.mockReturnValue(true);
      services.phoneNumberValidator.mockReturnValue(true);
      utils.errorCodesGenerator.mockReturnValue([]);
      utils.utilityResponse.mockImplementation(({ errorCodes, data, res, isXml }) => {
          res.status(200).json({ errorCodes, data });
      });

      // Mock console.error
      global.console.error = jest.fn();
  });

  afterEach(() => {
      // Restore console.error
      global.console.error.mockRestore();
  });

  it('should validate payment successfully', () => {
      validateCard(req, res);

      expect(services.lunhValidator).toHaveBeenCalledWith('4111111111111111');
      expect(services.cardIssuer).toHaveBeenCalledWith('4111111111111111');
      expect(services.expiryDateValidator).toHaveBeenCalledWith('12/23');
      expect(services.emailValidator).toHaveBeenCalledWith('test@example.com');
      expect(services.cvv2Validator).toHaveBeenCalledWith('123', 'VISA');
      expect(services.phoneNumberValidator).toHaveBeenCalledWith('1234567890');
      expect(utils.errorCodesGenerator).toHaveBeenCalledWith({
          isCard: true,
          issuer: 'VISA',
          hasExpired: false,
          validEmail: true,
          validCvv: true,
          validPhoneNumber: true
      });
      expect(utils.utilityResponse).toHaveBeenCalledWith({
          errorCodes: [],
          data: { issuer: 'VISA' },
          res,
          isXml: false
      });
  });

  it('should handle invalid card number', () => {
      services.lunhValidator.mockReturnValue(false);

      validateCard(req, res);

      expect(utils.errorCodesGenerator).toHaveBeenCalledWith(expect.objectContaining({ isCard: false }));
  });

  it('should handle expired card', () => {
      services.expiryDateValidator.mockReturnValue(true);

      validateCard(req, res);

      expect(utils.errorCodesGenerator).toHaveBeenCalledWith(expect.objectContaining({ hasExpired: true }));
  });

  it('should handle invalid email', () => {
      services.emailValidator.mockReturnValue(false);

      validateCard(req, res);

      expect(utils.errorCodesGenerator).toHaveBeenCalledWith(expect.objectContaining({ validEmail: false }));
  });

  it('should handle invalid CVV', () => {
      services.cvv2Validator.mockReturnValue(false);

      validateCard(req, res);

      expect(utils.errorCodesGenerator).toHaveBeenCalledWith(expect.objectContaining({ validCvv: false }));
  });

  it('should handle invalid phone number', () => {
      services.phoneNumberValidator.mockReturnValue(false);

      validateCard(req, res);

      expect(utils.errorCodesGenerator).toHaveBeenCalledWith(expect.objectContaining({ validPhoneNumber: false }));
  });

  it('should handle unexpected error', () => {
      const error = new Error('Unexpected error');
      services.lunhValidator.mockImplementation(() => { throw error; });

      validateCard(req, res);

      expect(console.error).toHaveBeenCalledWith('Validation Error:', error);
      expect(utils.utilityResponse).toHaveBeenCalledWith({
          errorCodes: ['An unexpected error occurred. Please try again.'],
          res,
          statusCode: 500
      });
  });
});