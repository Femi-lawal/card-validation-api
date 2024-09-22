export default (req, res, next) => {
    const contentType = req.header('Content-Type') || '';
    
    // Check if the content type is XML
    if (/xml$/i.test(contentType)) {
        const oldBody = req.body?.root;

        // Validate the presence of required fields in the XML body
        if (oldBody && oldBody.creditcardnumber && oldBody.expirationdate && oldBody.cvv2 && oldBody.email && oldBody.mobile && oldBody.phonenumber) {
            // Map old XML body to a new JSON structure
            const newBody = {
                creditCardNumber: oldBody.creditcardnumber[0] || '',
                expirationDate: oldBody.expirationdate[0] || '',
                cvv2: oldBody.cvv2[0] || '',
                email: oldBody.email[0] || '',
                mobile: oldBody.mobile[0] || '',
                phoneNumber: oldBody.phonenumber[0] || '',
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
