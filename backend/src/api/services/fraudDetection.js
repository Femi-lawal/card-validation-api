const calculateRiskScore = (transactionData) => {
  let riskScore = 0;

  // Amount-based risk
  if (transactionData.amount > 1000) riskScore += 30;
  else if (transactionData.amount > 500) riskScore += 15;
  else if (transactionData.amount > 100) riskScore += 5;

  // Email domain risk
  const disposableDomains = ['tempmail.com', 'guerrillamail.com', 'mailinator.com'];
  const emailDomain = transactionData.email?.split('@')[1];
  if (disposableDomains.includes(emailDomain)) riskScore += 40;

  // Test card detection
  const testCards = ['4242424242424242', '5555555555554444'];
  if (testCards.includes(transactionData.cardNumber?.replace(/\s/g, ''))) {
    riskScore = 0; // Test cards have no risk
  }

  // Simulated country-based risk
  const highRiskCountries = ['NG', 'RU', 'CN'];
  const phoneCountryCode = transactionData.phoneNumber?.substring(0, 3);
  if (highRiskCountries.includes(phoneCountryCode)) riskScore += 25;

  return Math.min(riskScore, 100);
};

const getRiskLevel = (riskScore) => {
  if (riskScore < 30) return 'low';
  if (riskScore < 70) return 'medium';
  return 'high';
};

const shouldDeclineTransaction = (riskScore) => {
  return riskScore >= 75;
};

module.exports = {
  calculateRiskScore,
  getRiskLevel,
  shouldDeclineTransaction,
};
