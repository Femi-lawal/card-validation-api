import utils from '../../utils';
import Validator from '../services';
const { errorCodesGenerator, utilityResponse } = utils;
class CardController {
	static validatePayment = (req, res) => {
		try {
			const { creditCardNumber, expirationDate, cvv2, email, mobile, phoneNumber, isXml } = req.body;
			const cardNumber = creditCardNumber.replace(/\s/g, '');
			let errorCodes = [];
			const validator = new Validator(cardNumber, expirationDate, cvv2, email, mobile, phoneNumber);
			const isCard = validator.isCard;
			const issuer = validator.issuer;
			const hasExpired = validator.hasExpired;
			const validEmail = validator.validEmail;
			const validCvv = validator.validCvv;
			const validPhoneNumber = validator.validPhoneNumber;
			const data = { issuer };
			errorCodes = errorCodesGenerator({ isCard, issuer, hasExpired, validEmail, validCvv, validPhoneNumber });

			return utilityResponse({ errorCodes, data, res, isXml });
		} catch (error) {
			console.log(error);
			return utilityResponse({ errorCodes: error.message, res, statusCode: 500 });
		}
	};
}

export default CardController;
