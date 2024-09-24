export default (card = '') => {
    // Validate input card number
    if (!card || typeof card !== 'string') {
        return 'invalid';
    }

    const cardTypes = {
        amex: /^3[47][0-9]{13}$/,
        dankort: /^(5019)\d+$/,
        diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
        discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
        electron: /^(4026|417500|4405|4508|4844|4913|4917)\d+$/,
        interpayment: /^(636)\d+$/,
        jcb: /^(?:2131|1800|35\d{3})\d{11}$/,
        maestro: /^(5018|5020|5038|5612|5893|6304|6759|6761|6762|6763|0604|6390)\d+$/,
        mastercard:
            /^(5[1-5][0-9]{14}|2(?:2[2-9]|[3-6]|7[01])[0-9]{14}|2720[0-9]{12})$/,
        unionpay: /^(62|88)\d+$/,
        visa: /^4[0-9]{12}(?:[0-9]{3})?$/
    };

    // Check card against each pattern and return type
    for (const type in cardTypes) {
        if (cardTypes[type].test(card)) {
            return type;
        }
    }

    // Return 'unknown' if no match found
    return 'unknown';
};
