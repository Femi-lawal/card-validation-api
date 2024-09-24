import parseBody from '../../src/middleware/parseBody';
import { jest } from '@jest/globals';

describe('Body Parser Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            get: jest.fn(),
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    test('should correctly map and transform the XML body to the expected JSON format', () => {
        req.get.mockReturnValue('application/xml');
        req.body = {
            root: {
                creditcardnumber: '1234567890123456',
                expirationdate: '12/34',
                cvv2: '123',
                email: 'test@example.com',
                mobile: '08123456789',
                phonenumber: '+2348123456789'
            }
        };

        parseBody(req, res, next);

        expect(req.body).toEqual({
            creditCardNumber: '1234567890123456',
            expirationDate: '12/34',
            cvv2: '123',
            email: 'test@example.com',
            mobile: '08123456789',
            phoneNumber: '+2348123456789',
            isXml: true
        });
        expect(next).toHaveBeenCalled();
    });

    test('should return an error if required fields are missing in the XML body', () => {
        req.get.mockReturnValue('application/xml');
        req.body = {
            root: {
                creditcardnumber: '1234567890123456'
                // Missing other required fields
            }
        };

        parseBody(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Invalid XML structure',
            message: 'The following required fields are missing: expirationdate, cvv2, email, mobile, phonenumber. Please ensure all required fields are provided.'
        });
        expect(next).not.toHaveBeenCalled();
    });

    test('should proceed to next middleware if Content-Type is not XML', () => {
        req.get.mockReturnValue('application/json');
        req.body = {
            key: 'value'
        };

        parseBody(req, res, next);

        expect(req.body).toEqual({ key: 'value' });
        expect(next).toHaveBeenCalled();
    });
});
