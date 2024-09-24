import { toXml } from 'xml2json';

export default (jsonObject) => {
    try {
        // Create a properly structured object for XML conversion
        const newObject = {
            root: {
                valid: {
                    isValid: jsonObject.valid
                },
                issuer: {
                    issuer: jsonObject.issuer
                },
                errorCodes: {
                    code: jsonObject.errorCodes // Assumes errorCodes is an array of strings
                }
            }
        };

        // Convert to XML format
        const xmlResponse = toXml(newObject);

        return xmlResponse;
    } catch (error) {
        console.error('Error converting JSON to XML:', error);
        throw new Error('Conversion failed. Please check the JSON format.');
    }
};
