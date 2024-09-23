import utils from '../../utils';
import services from '../services';

const {
    cardIssuer,
    cvv2Validator,
    emailValidator,
    expiryDateValidator,
    lunhValidator,
    phoneNumberValidator
} = services;
const { errorCodesGenerator, utilityResponse } = utils;

const validatePayment = (req, res) => {
    try {
        // Extract and validate request body
        const { creditCardNumber = '', expirationDate, cvv2, email, phoneNumber, isXml } = req.body;
        
        // Remove spaces from card number and validate
        const cardNumber = creditCardNumber.replace(/\s/g, '');
        const isCard = lunhValidator(cardNumber);
        const issuer = cardIssuer(cardNumber);
        const hasExpired = expiryDateValidator(expirationDate);
        const validEmail = emailValidator(email);
        const validCvv = cvv2Validator(cvv2, issuer);
        const validPhoneNumber = phoneNumberValidator(phoneNumber);

        // Generate error codes
        const errorCodes = errorCodesGenerator({ isCard, issuer, hasExpired, validEmail, validCvv, validPhoneNumber });

        // Prepare response data
        const data = { issuer };

        // Send response
        return utilityResponse({ errorCodes, data, res, isXml });
    } catch (error) {
        // Log error and send generic message
        console.error('Validation Error:', error);
        return utilityResponse({
            errorCodes: ['An unexpected error occurred. Please try again.'],
            res,
            statusCode: 500
        });
    }
};

export { validatePayment };
