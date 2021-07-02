import utils from '../../utils';
import services from '../services';
const { cardIssuer, cvv2Validator, emailValidator, expiryDateValidator, lunhValidator, phoneNumberValidator } =
	services;
const { errorCodesGenerator, utilityResponse } = utils;

const validatePayment = (req, res) => {
	try {
		console.log(req.body);
		const { creditCardNumber, expirationDate, cvv2, email, mobile, phoneNumber, isXml } = req.body;
		const cardNumber = creditCardNumber.replace(/\s/g, '');
		let errorCodes = [];
		const isCard = lunhValidator(cardNumber);
		const issuer = cardIssuer(cardNumber);
		const hasExpired = expiryDateValidator(expirationDate);
		const validEmail = emailValidator(email);
		const validCvv = cvv2Validator(cvv2, issuer);
		const validPhoneNumber = phoneNumberValidator(phoneNumber);
		const data = { issuer };
		errorCodes = errorCodesGenerator({ isCard, issuer, hasExpired, validEmail, validCvv, validPhoneNumber });

		return utilityResponse({ errorCodes, data: { issuer }, res, isXml });
	} catch (error) {
		console.log(error);
		return utilityResponse({ errorCodes: error.message, res, statusCode: 500 });
	}
};

export { validatePayment };
