export default (req, res, next) => {
    const contentType = req.get('Content-Type') || '';

    // Check if the content type is XML
    if (/xml$/i.test(contentType)) {
        const oldBody = req.body?.root;

        // Validate the presence of required fields in the XML body
        const requiredFields = ['creditcardnumber', 'expirationdate', 'cvv2', 'email', 'mobile', 'phonenumber'];
        const missingFields = requiredFields.filter(field => !oldBody?.[field]);

        if (missingFields.length > 0) {
            // Return an error if required fields are missing
            return res.status(400).json({
                error: 'Invalid XML structure',
                message: `The following required fields are missing: ${missingFields.join(', ')}. Please ensure all required fields are provided.`
            });
        }

        // Map old XML body to a new JSON structure dynamically
        const fieldMappings = {
            creditcardnumber: 'creditCardNumber',
            expirationdate: 'expirationDate',
            cvv2: 'cvv2',
            email: 'email',
            mobile: 'mobile',
            phonenumber: 'phoneNumber',
        };

        const newBody = {};
        for (const [oldKey, newKey] of Object.entries(fieldMappings)) {
            newBody[newKey] = Array.isArray(oldBody[oldKey]) ? oldBody[oldKey][0] : oldBody[oldKey];
        }
        newBody.isXml = true;

        req.body = newBody; // Assign the new structured body
    }

    next(); // Proceed to the next middleware
};
