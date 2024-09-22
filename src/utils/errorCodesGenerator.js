// errorMessages.js (a separate file to store messages)
export const errorMessages = {
	isCard: 'creditCardNumber: The card number is invalid',
	expirationDate: 'expirationDate: The card has expired',
	validEmail: 'email: The email is not valid',
	validCvv: 'cVV2: The CVV2 is not valid',
	validPhoneNumber: 'phoneNumber: The phone number is not valid, only Nigerian phone numbers are allowed',
};

// errorCodesGenerator.js
import { errorMessages } from './errorMessages';

export default function generateErrorCodes({
	isCard = true,
	issuer = '',
	hasExpired = [true, ''],
	validEmail = true,
	validCvv = true,
	validPhoneNumber = true,
} = {}) {
	const errorMessagesList = [];

	if (!isCard) errorMessagesList.push(errorMessages.isCard);
	if (!hasExpired[0]) errorMessagesList.push(`${errorMessages.expirationDate}: ${hasExpired[1]}`);
	if (!validEmail) errorMessagesList.push(errorMessages.validEmail);
	if (!validCvv) errorMessagesList.push(errorMessages.validCvv);
	if (!validPhoneNumber) errorMessagesList.push(errorMessages.validPhoneNumber);

	return errorMessagesList;
}
