import xmlObject from './xmlObject';
const utilityResponse = ({ res, data = {}, isXml = false, errorCodes, statusCode = 500 }) => {
	if (errorCodes.length === 0) {
		statusCode = 200;
	}
	const responseObject = {
		valid: !(statusCode.toString().startsWith('4') || statusCode.toString().startsWith('5')),
		errorCodes,
	};
	if (responseObject.valid) {
		console.log('here');
		responseObject.issuer = data.issuer;
	}
	if (isXml) {
		const xmlResponse = xmlObject(responseObject);
		res.status(statusCode).set('Content-Type', 'text/xml');
		return res.send(xmlResponse);
	} else {
		return res.status(statusCode).json(responseObject);
	}
};

export default utilityResponse;
