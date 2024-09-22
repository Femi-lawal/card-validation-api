import utils from '../../utils';

const { utilityResponse } = utils;

const cardRequestValidator = (req, res, next) => {
    const { creditCardNumber, expirationDate, cvv2, email } = req.body;

    // Fields to be validated
    const requiredFields = ['creditCardNumber', 'expirationDate', 'cvv2', 'email'];

    // Collect error codes
    const errorCodes = requiredFields.reduce((acc, field) => {
        if (!req.body[field]) {
            acc.push(`${field}: This field cannot be empty`);
        }
        return acc;
    }, []);

    // Respond if there are errors
    if (errorCodes.length > 0) {
        return utilityResponse({
            errorCodes,
            res,
            statusCode: 400
        });
    }

    // Proceed to next middleware
    next();
};

export default cardRequestValidator;
