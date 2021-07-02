export default (cvv, type) => {
	let maxDigits = 3;
	if (type === 'amex') {
		maxDigits = 4;
	}
	if (!/^\d*$/.test(cvv)) {
		return false;
	}
	return cvv.length === maxDigits;
};
