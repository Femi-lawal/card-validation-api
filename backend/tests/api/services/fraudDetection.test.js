const { calculateRiskScore, getRiskLevel, shouldDeclineTransaction } = require('../../../src/api/services/fraudDetection');

describe('Fraud Detection Service', () => {
  describe('calculateRiskScore', () => {
    test('should return 0 for test cards', () => {
      const score = calculateRiskScore({
        cardNumber: '4242424242424242',
        email: 'test@example.com',
        phoneNumber: '+14155552671',
        amount: 100,
      });
      expect(score).toBe(0);
    });

    test('should add risk for high amount', () => {
      const score = calculateRiskScore({
        cardNumber: '1234567890123456',
        email: 'test@example.com',
        phoneNumber: '+14155552671',
        amount: 1500,
      });
      expect(score).toBeGreaterThan(20);
    });

    test('should add risk for disposable email', () => {
      const score = calculateRiskScore({
        cardNumber: '1234567890123456',
        email: 'test@tempmail.com',
        phoneNumber: '+14155552671',
        amount: 50,
      });
      expect(score).toBeGreaterThan(30);
    });
  });

  describe('getRiskLevel', () => {
    test('should return low for score < 30', () => {
      expect(getRiskLevel(25)).toBe('low');
    });

    test('should return medium for score 30-69', () => {
      expect(getRiskLevel(50)).toBe('medium');
    });

    test('should return high for score >= 70', () => {
      expect(getRiskLevel(75)).toBe('high');
    });
  });

  describe('shouldDeclineTransaction', () => {
    test('should decline at score >= 75', () => {
      expect(shouldDeclineTransaction(75)).toBe(true);
      expect(shouldDeclineTransaction(100)).toBe(true);
    });

    test('should not decline at score < 75', () => {
      expect(shouldDeclineTransaction(74)).toBe(false);
      expect(shouldDeclineTransaction(0)).toBe(false);
    });
  });
});
