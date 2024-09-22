export default (phoneNumber = '') => {
    // Check if input is a string
    if (typeof phoneNumber !== 'string') {
        return false;
    }

    // Regular expression for validating Nigerian phone numbers
    const expression = /^(\+?234|0)([0-9]{10})$/;

    // Test the phone number against the regex
    return expression.test(phoneNumber);
};
