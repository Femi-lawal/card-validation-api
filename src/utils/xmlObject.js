import { response } from 'express';
import { toXml } from 'xml2json';

export default jsonObject => {
	const newObject = { root: { valid: { value: jsonObject.valid }, errorCodes: { value: jsonObject.errorCodes } } };
	const response = toXml(newObject);
	return response;
};
