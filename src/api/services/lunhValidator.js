export default (card = '') => {
    // Validate input type and format
    if (typeof card !== 'string' || !/^[0-9]{13,19}$/.test(card)) {
        return false;
    }

    return calculateLuhnChecksum(card);
};

const calculateLuhnChecksum = card => {
    let checkSum = 0;
    let doubleDigit = false;

    for (let i = card.length - 1; i >= 0; i--) {
        let digit = parseInt(card[i], 10);

        // Double every second digit
        if (doubleDigit) {
            digit *= 2;
            if (digit > 9) digit -= 9; // Adjust for digits over 9
        }

        checkSum += digit;
        doubleDigit = !doubleDigit; // Toggle the flag
    }

    return checkSum % 10 === 0;
};
