import utils from '../../utils';

const { utilityResponse } = utils;

const cardRequestValidator = (req, res, next) => {
	const { creditCardNumber, expirationDate, cvv2, email } = req.body;
	const requiredFields = { creditCardNumber, expirationDate, cvv2, email };
	const errorCodes = [];
	for (let param in requiredFields) {
		if (!requiredFields[param]) {
			errorCodes.push(`${param}: This field cannot be empty`);
		}
	}
	if (errorCodes.length > 0) {
		return utilityResponse({
			errorCodes,
			message: 'Request incomplete',
			res,
			statusCode: 400,
		});
	} else {
		next();
	}
};

export default cardRequestValidator;
