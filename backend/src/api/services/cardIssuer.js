const getCardIssuer = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');

  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  if (/^6(?:011|5)/.test(cleaned)) return 'discover';
  if (/^35/.test(cleaned)) return 'jcb';
  if (/^3(?:0[0-5]|[68])/.test(cleaned)) return 'diners';
  if (/^(?:5[06789]|6)/.test(cleaned)) return 'maestro';
  if (/^62/.test(cleaned)) return 'unionpay';

  return 'unknown';
};

module.exports = { getCardIssuer };
