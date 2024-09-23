export default (req, res, next) => {
    const contentType = req.header('Content-Type') || '';
    
    // Check if the content type is XML
    if (/xml$/i.test(contentType)) {
        const oldBody = req.body?.root;

        // Validate the presence of required fields in the XML body
        const requiredFields = ['creditcardnumber', 'expirationdate', 'cvv2', 'email', 'mobile', 'phonenumber'];
        const hasAllFields = requiredFields.every(field => oldBody && oldBody[field]);
        if (hasAllFields) {
            // Map old XML body to a new JSON structure
            const newBody = {
                creditCardNumber: Array.isArray(oldBody.creditcardnumber) ? oldBody.creditcardnumber[0] : '',
                expirationDate: Array.isArray(oldBody.expirationdate) ? oldBody.expirationdate[0] : '',
                cvv2: Array.isArray(oldBody.cvv2) ? oldBody.cvv2[0] : '',
                email: Array.isArray(oldBody.email) ? oldBody.email[0] : '',
                mobile: Array.isArray(oldBody.mobile) ? oldBody.mobile[0] : '',
                phoneNumber: Array.isArray(oldBody.phonenumber) ? oldBody.phonenumber[0] : '',
                isXml: true,
            };
            
            req.body = newBody; // Assign the new structured body
        } else {
            // Return an error if the XML structure is not as expected
            return res.status(400).json({ error: 'Invalid XML structure' });
        }
    }
    next(); // Proceed to the next middleware
};
