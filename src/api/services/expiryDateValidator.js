export default (expiration = '') => {
    // Validate input type and format
    if (typeof expiration !== 'string' || expiration.length !== 5 || expiration.indexOf('/') === -1) {
        return [false, 'Only MM/YY date format is accepted e.g 03/24 (March 2024)'];
    }

    const [monthStr, yearStr] = expiration.split('/');
    const expirationMonth = parseInt(monthStr, 10);
    const expirationYear = parseInt(yearStr, 10);

    // Validate parsed values
    if (Number.isNaN(expirationMonth) || Number.isNaN(expirationYear) || expirationMonth < 1 || expirationMonth > 12) {
        return [false, 'Invalid month or year in expiration date'];
    }

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear() % 100;

    // Check if the card has expired
    if (expirationYear > currentYear || (expirationYear === currentYear && expirationMonth >= currentMonth)) {
        return [true];
    }

    return [false, 'The card has expired'];
};
