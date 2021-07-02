export default phoneNumber => {
	const expresssion = /^(\+?234|0)([0-9]{10})$/;
	return expresssion.test(phoneNumber);
};
