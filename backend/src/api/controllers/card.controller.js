const { validateLuhn, getCardIssuer, validateEmail, validateCVV2, validateExpiryDate, validatePhoneNumber } = require('../services');

const validateCard = (req, res) => {
  const { cardNumber, expirationDate, cvv2, email, phoneNumber } = req.body;

  // Check for required fields
  if (!cardNumber || !expirationDate || !cvv2 || !email || !phoneNumber) {
    return res.status(400).json({
      success: false,
      errors: ['Missing required fields: cardNumber, expirationDate, cvv2, email, phoneNumber']
    });
  }

  const errors = [];

  if (!validateLuhn(cardNumber)) errors.push('Invalid card number');
  if (!validateExpiryDate(expirationDate)) errors.push('Invalid or expired date');
  if (!validateEmail(email)) errors.push('Invalid email');
  if (!validatePhoneNumber(phoneNumber)) errors.push('Invalid phone number');

  const cardType = getCardIssuer(cardNumber);

  // Explicitly reject unknown card types
  if (cardType === 'unknown') {
    errors.push('Unsupported card type');
  } else if (!validateCVV2(cvv2, cardType)) {
    errors.push('Invalid CVV');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  res.json({
    success: true,
    cardType,
    message: 'Card validation successful',
  });
};

module.exports = { validateCard };
