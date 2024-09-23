import xmlObject from './xmlObject';

// Utility response function with improved best practices
const utilityResponse = ({
    res,
    data = {},
    isXml = false,
    errorCodes = [],
    statusCode = 500
} = {}) => {
    // Check if there are no error codes, set status code to 200 (OK)
    if (Array.isArray(errorCodes) && errorCodes.length === 0) {
        statusCode = 200;
    }

    // Construct the response object
    const responseObject = {
        valid: statusCode < 400,
        errorCodes,
        ...(statusCode < 400 && { issuer: data.issuer })
    };

    // Send XML response if isXml is true
    if (isXml) {
        const xmlResponse = xmlObject(responseObject);
        res.status(statusCode).set('Content-Type', 'application/xml');
        return res.send(xmlResponse);
    }

    // Default to JSON response
    return res.status(statusCode).json(responseObject);
};

export default utilityResponse;
