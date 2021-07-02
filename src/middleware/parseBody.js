export default (req, res, next) => {
	if (req.header('Content-Type').endsWith('xml')) {
		const oldBody = req.body.root;
		const newBody = {
			creditCardNumber: oldBody.creditcardnumber[0],
			expirationDate: oldBody.expirationdate[0],
			cvv2: oldBody.cvv2[0],
			email: oldBody.email[0],
			mobile: oldBody.mobile[0],
			phoneNumber: oldBody.phonenumber[0],
			isXml: true,
		};
		req.body = newBody;
	}
	next();
};
