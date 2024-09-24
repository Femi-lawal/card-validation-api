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
