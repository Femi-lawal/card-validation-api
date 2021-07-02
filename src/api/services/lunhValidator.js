export default card => {
	const expression = new RegExp('^[0-9]{13,19}$');
	if (!expression.test(card)) {
		return false;
	}

	return luhnAlgorithm(card);
};

const luhnAlgorithm = card => {
	let lastIndex = card.length - 1;

	let checkSum = 0;
	let isFirst = true;
	for (lastIndex; lastIndex >= 0; lastIndex--) {
		let digit = card[lastIndex].charCodeAt() - '0'.charCodeAt();

		if (isFirst === false) {
			digit = digit * 2;
		}
		checkSum += parseInt(digit / 10, 10);
		checkSum += digit % 10;

		isFirst = !isFirst;
	}
	return checkSum % 10 === 0;
};
