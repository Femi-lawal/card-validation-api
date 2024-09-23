const cvvLengths = {
    amex: 4,
    default: 3
};

export default (cvv = '', type = 'default') => {
    // Check if CVV is a valid string of digits
    if (typeof cvv !== 'string' || !/^\d+$/.test(cvv)) {
        return false;
    }

    // Determine the maximum length based on card type
    const maxDigits = cvvLengths[type] || cvvLengths.default;

    // Return true if CVV length matches the required length
    return cvv.length === maxDigits;
};
