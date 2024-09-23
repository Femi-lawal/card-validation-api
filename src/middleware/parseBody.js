export default (req, res, next) => {
    const contentType = req.header('Content-Type') || '';

    // Check if the content type is XML
    if (/xml$/i.test(contentType)) {
        const oldBody = req.body?.root;

        // Validate the presence of required fields in the XML body
        const requiredFields = ['creditcardnumber', 'expirationdate', 'cvv2', 'email', 'mobile', 'phonenumber'];
        const hasAllFields = requiredFields.every(field => oldBody?.[field]);
        console.log('hasAllFields', hasAllFields);
        if (hasAllFields) {
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
        } else {
            // Return an error if the XML structure is not as expected
            return res.status(400).json({ error: 'Invalid XML structure' });
        }
    }
    next(); // Proceed to the next middleware
};

