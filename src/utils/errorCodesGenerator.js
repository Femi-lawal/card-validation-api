export default ({ isCard, issuer, hasExpired, validEmail, validCvv, validPhoneNumber }) => {
	const errorCodes = [];
	console.log(issuer);
	if (!isCard) {
		errorCodes.push('creditCardNumber: The card number is invalid');
	}
	if (!hasExpired[0]) {
		errorCodes.push(`expirationDate: ${hasExpired[1]}`);
	}
	if (!validEmail) {
		errorCodes.push('email: The email is not valid');
	}
	if (!validCvv) {
		errorCodes.push('cVV2: The CVV2 is not valid');
	}
	if (!validPhoneNumber) {
		errorCodes.push('phoneNumber: The phoneNumber is not valid, only Nigerian phone numbers are allowed');
	}
	return errorCodes;
};
