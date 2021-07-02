export default expiration => {
	if (expiration.indexOf('/') === -1 || expiration.length !== 5) {
		return [false, 'Only MM/YY date format is accepted e.g 03/24 (March 2024)'];
	}
	const expirationList = expiration.split('/');
	const expirationMonth = parseInt(expirationList[0]);
	const expirationYear = parseInt(expirationList[1]);
	const today = new Date();
	const currentMonth = today.getMonth() + 1;
	const currentYear = today.getFullYear() % 100;
	const higherYear = currentYear < expirationYear;
	const sameYear = currentYear === expirationYear;
	const higherMonth = currentMonth < expirationMonth;
	if (higherYear) {
		return [true];
	}
	if (sameYear && higherMonth) {
		return [true];
	}
	return [false, 'The card has expired'];
};
