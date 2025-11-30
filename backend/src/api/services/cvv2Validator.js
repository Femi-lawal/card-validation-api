const validateCVV2 = (cvv, cardType) => {
  if (cardType === 'amex') {
    return /^\d{4}$/.test(cvv);
  }
  return /^\d{3}$/.test(cvv);
};

module.exports = { validateCVV2 };
