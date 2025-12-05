'use client';

import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

// Card network configurations with proper brand colors and gradients
const CARD_NETWORKS = {
  visa: {
    color: '#1A1F71',
    gradient: 'linear-gradient(135deg, #1A1F71 0%, #2E3B8E 50%, #1A1F71 100%)',
    name: 'VISA',
    regex: /^4/,
    cvvLength: 3
  },
  mastercard: {
    color: '#EB001B',
    gradient: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
    name: 'MASTERCARD',
    regex: /^5[1-5]/,
    cvvLength: 3
  },
  amex: {
    color: '#006FCF',
    gradient: 'linear-gradient(135deg, #006FCF 0%, #00A1E4 50%, #006FCF 100%)',
    name: 'AMEX',
    regex: /^3[47]/,
    cvvLength: 4
  },
  discover: {
    color: '#FF6000',
    gradient: 'linear-gradient(135deg, #FF6000 0%, #FF8C00 50%, #FF6000 100%)',
    name: 'DISCOVER',
    regex: /^6(?:011|5)/,
    cvvLength: 3
  },
  jcb: {
    color: '#0B4EA2',
    gradient: 'linear-gradient(135deg, #0B4EA2 0%, #1E6FBA 50%, #0B4EA2 100%)',
    name: 'JCB',
    regex: /^35/,
    cvvLength: 3
  },
  diners: {
    color: '#0079BE',
    gradient: 'linear-gradient(135deg, #0079BE 0%, #00A3E0 50%, #0079BE 100%)',
    name: 'DINERS',
    regex: /^3(?:0[0-5]|[68])/,
    cvvLength: 3
  },
};

const TEST_CARDS = [
  { name: 'Visa', number: '4242424242424242', icon: '💳' },
  { name: 'Mastercard', number: '5555555555554444', icon: '💳' },
  { name: 'Amex', number: '378282246310005', icon: '💳' },
];

// Luhn algorithm for card validation
const validateCardNumber = (number: string): boolean => {
  const cleaned = number.replace(/\s/g, '');
  if (!/^\d+$/.test(cleaned) || cleaned.length < 13) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

// Format card number with spaces
const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
};

// Format expiry date
const formatExpiryDate = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
  }
  return cleaned;
};

export default function Home() {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expirationDate: '',
    cvv2: '',
    email: '',
    phoneNumber: '',
    cardholderName: '',
    amount: '100',
  });
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [recentTransactions, setRecentTransactions] = useState<Array<{ id: string, amount: string, status: string, date: string }>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const detectCardType = useCallback((number: string) => {
    const cleaned = number.replace(/\s/g, '');
    for (const [type, data] of Object.entries(CARD_NETWORKS)) {
      if (data.regex.test(cleaned)) return type;
    }
    return null;
  }, []);

  const cardType = detectCardType(formData.cardNumber);
  const cardNetwork = cardType ? CARD_NETWORKS[cardType as keyof typeof CARD_NETWORKS] : null;
  const cardGradient = cardNetwork ? cardNetwork.gradient : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

  // Validate fields in real-time
  const validateField = useCallback((field: string, value: string) => {
    const errors: { [key: string]: string } = {};

    switch (field) {
      case 'cardNumber':
        const cleanedNumber = value.replace(/\s/g, '');
        if (cleanedNumber.length > 0 && cleanedNumber.length < 13) {
          errors.cardNumber = 'Card number too short';
        } else if (cleanedNumber.length >= 13 && !validateCardNumber(cleanedNumber)) {
          errors.cardNumber = 'Invalid card number';
        }
        break;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Invalid email format';
        }
        break;
      case 'expirationDate':
        if (value) {
          const [month, year] = value.split('/');
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear() % 100;
          const currentMonth = currentDate.getMonth() + 1;
          if (parseInt(month) > 12 || parseInt(month) < 1) {
            errors.expirationDate = 'Invalid month';
          } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
            errors.expirationDate = 'Card expired';
          }
        }
        break;
      case 'cvv2':
        const expectedLength = cardNetwork?.cvvLength || 3;
        if (value && value.length !== expectedLength) {
          errors.cvv2 = `CVV must be ${expectedLength} digits`;
        }
        break;
      case 'amount':
        if (parseFloat(value) <= 0) {
          errors.amount = 'Amount must be greater than 0';
        }
        break;
    }

    setValidationErrors(prev => ({ ...prev, ...errors, [field]: errors[field] || '' }));
  }, [cardNetwork]);

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;

    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
      if (formattedValue.replace(/\s/g, '').length > 19) return;
    } else if (field === 'expirationDate') {
      formattedValue = formatExpiryDate(value);
      if (formattedValue.length > 5) return;
    } else if (field === 'cvv2') {
      formattedValue = value.replace(/\D/g, '');
      const maxLength = cardNetwork?.cvvLength || 4;
      if (formattedValue.length > maxLength) return;
    } else if (field === 'cardholderName') {
      formattedValue = value.toUpperCase();
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    validateField(field, formattedValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validate card number
    if (!validateCardNumber(formData.cardNumber.replace(/\s/g, ''))) {
      setError('Invalid card number');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(`Payment successful!`);
        setTransactionId(data.transactionId);

        // Add to recent transactions
        setRecentTransactions(prev => [{
          id: data.transactionId,
          amount: formData.amount,
          status: 'Success',
          date: new Date().toLocaleString()
        }, ...prev.slice(0, 4)]);

        // Epic confetti celebration
        const duration = 3000;
        const end = Date.now() + duration;
        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c'];

        (function frame() {
          confetti({
            particleCount: 4,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors
          });
          confetti({
            particleCount: 4,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors
          });
          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        }());

      } else {
        setError(data.message || 'Payment failed. Please try again.');
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  const fillTestCard = (card: typeof TEST_CARDS[0]) => {
    setFormData({
      ...formData,
      cardNumber: formatCardNumber(card.number),
      expirationDate: '12/28',
      cvv2: card.name === 'Amex' ? '1234' : '123',
      cardholderName: 'JOHN DOE',
      email: 'john.doe@example.com',
      phoneNumber: '+14155552671',
    });
    setValidationErrors({});
  };

  const resetForm = () => {
    setFormData({
      cardNumber: '',
      expirationDate: '',
      cvv2: '',
      email: '',
      phoneNumber: '',
      cardholderName: '',
      amount: '100',
    });
    setSuccess('');
    setError('');
    setTransactionId('');
    setValidationErrors({});
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">SecurePay</h1>
          </div>
          <p className="text-white/70 text-sm">Fast, secure payment processing</p>
        </div>

        {/* 3D Credit Card */}
        <div className={`card-container mb-6 ${isFlipped ? 'flipped' : ''} ${isShaking ? 'shake' : ''}`}>
          <div className="card-inner">
            {/* Card Front */}
            <div
              className="card-face card-front"
              style={{ background: cardGradient }}
            >
              {/* Chip */}
              <div className="absolute top-6 left-6">
                <div className="w-12 h-9 rounded-md bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 flex items-center justify-center overflow-hidden">
                  <div className="grid grid-cols-3 gap-px w-8 h-6">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="bg-yellow-600/30 rounded-sm"></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contactless Icon */}
              <div className="absolute top-6 right-6">
                <svg className="w-8 h-8 text-white/80 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8.5 14.5A6 6 0 0 0 8.5 9.5" strokeLinecap="round" />
                  <path d="M11 17a9 9 0 0 0 0-10" strokeLinecap="round" />
                  <path d="M14 19.5a12 12 0 0 0 0-15" strokeLinecap="round" />
                </svg>
              </div>

              {/* Card Number */}
              <div className="absolute bottom-20 left-6 right-6">
                <div className="text-xl md:text-2xl text-white font-mono tracking-widest">
                  {formData.cardNumber || '•••• •••• •••• ••••'}
                </div>
              </div>

              {/* Card Details */}
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div>
                  <div className="text-[10px] text-white/60 uppercase tracking-wider mb-1">Card Holder</div>
                  <div className="text-sm text-white font-medium tracking-wide">
                    {formData.cardholderName || 'YOUR NAME'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-white/60 uppercase tracking-wider mb-1">Expires</div>
                  <div className="text-sm text-white font-medium">
                    {formData.expirationDate || 'MM/YY'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white tracking-wider">
                    {cardNetwork?.name || ''}
                  </div>
                </div>
              </div>

              {/* Holographic effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-2xl pointer-events-none"></div>
            </div>

            {/* Card Back */}
            <div className="card-face card-back" style={{ background: cardGradient }}>
              {/* Magnetic Strip */}
              <div className="absolute top-8 left-0 right-0 h-12 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"></div>

              {/* Signature Strip with CVV */}
              <div className="absolute top-24 left-6 right-6 flex gap-4 items-center">
                <div className="flex-1 h-10 bg-white/90 rounded flex items-center justify-end pr-4">
                  <span className="font-mono text-gray-700 italic text-sm tracking-widest">
                    {formData.cvv2 || '•••'}
                  </span>
                </div>
                <div className="text-white/80 text-xs">CVV</div>
              </div>

              {/* Info Text */}
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-[9px] text-white/50 leading-relaxed">
                  This card is property of SecurePay Financial Services. Use of this card is subject to the cardholder agreement.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Cards */}
        <div className="flex gap-2 mb-4 justify-center">
          <span className="text-white/50 text-xs self-center mr-2">Quick fill:</span>
          {TEST_CARDS.map((card) => (
            <button
              key={card.name}
              onClick={() => fillTestCard(card)}
              className="glass-button px-3 py-1.5 rounded-full text-white text-xs font-medium hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              {card.name}
            </button>
          ))}
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
          {/* Card Number */}
          <div className="relative">
            <input
              type="text"
              placeholder="Card Number"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              onFocus={() => setFocusedField('cardNumber')}
              onBlur={() => setFocusedField(null)}
              className={`input-field ${focusedField === 'cardNumber' ? 'ring-2 ring-white/50' : ''} ${validationErrors.cardNumber ? 'ring-2 ring-red-400' : ''}`}
              required
            />
            {cardNetwork && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white font-bold text-sm">
                {cardNetwork.name}
              </span>
            )}
            {validationErrors.cardNumber && (
              <p className="text-red-300 text-xs mt-1">{validationErrors.cardNumber}</p>
            )}
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="MM/YY"
                value={formData.expirationDate}
                onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                onFocus={() => setFocusedField('expirationDate')}
                onBlur={() => setFocusedField(null)}
                className={`input-field ${focusedField === 'expirationDate' ? 'ring-2 ring-white/50' : ''} ${validationErrors.expirationDate ? 'ring-2 ring-red-400' : ''}`}
                required
              />
              {validationErrors.expirationDate && (
                <p className="text-red-300 text-xs mt-1">{validationErrors.expirationDate}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                placeholder={`CVV${cardNetwork?.cvvLength === 4 ? ' (4 digits)' : ''}`}
                value={formData.cvv2}
                onFocus={() => { setIsFlipped(true); setFocusedField('cvv2'); }}
                onBlur={() => { setIsFlipped(false); setFocusedField(null); }}
                onChange={(e) => handleInputChange('cvv2', e.target.value)}
                className={`input-field ${focusedField === 'cvv2' ? 'ring-2 ring-white/50' : ''} ${validationErrors.cvv2 ? 'ring-2 ring-red-400' : ''}`}
                required
              />
              {validationErrors.cvv2 && (
                <p className="text-red-300 text-xs mt-1">{validationErrors.cvv2}</p>
              )}
            </div>
          </div>

          {/* Cardholder Name */}
          <input
            type="text"
            placeholder="Cardholder Name"
            value={formData.cardholderName}
            onChange={(e) => handleInputChange('cardholderName', e.target.value)}
            onFocus={() => setFocusedField('cardholderName')}
            onBlur={() => setFocusedField(null)}
            className={`input-field ${focusedField === 'cardholderName' ? 'ring-2 ring-white/50' : ''}`}
            required
          />

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              className={`input-field ${focusedField === 'email' ? 'ring-2 ring-white/50' : ''} ${validationErrors.email ? 'ring-2 ring-red-400' : ''}`}
              required
            />
            {validationErrors.email && (
              <p className="text-red-300 text-xs mt-1">{validationErrors.email}</p>
            )}
          </div>

          {/* Phone */}
          <input
            type="tel"
            placeholder="Phone (+1234567890)"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            onFocus={() => setFocusedField('phoneNumber')}
            onBlur={() => setFocusedField(null)}
            className={`input-field ${focusedField === 'phoneNumber' ? 'ring-2 ring-white/50' : ''}`}
            required
          />

          {/* Amount */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 font-medium">$</span>
            <input
              type="number"
              placeholder="Amount"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              onFocus={() => setFocusedField('amount')}
              onBlur={() => setFocusedField(null)}
              className={`input-field pl-8 ${focusedField === 'amount' ? 'ring-2 ring-white/50' : ''} ${validationErrors.amount ? 'ring-2 ring-red-400' : ''}`}
              required
              min="0.01"
              step="0.01"
            />
            {validationErrors.amount && (
              <p className="text-red-300 text-xs mt-1">{validationErrors.amount}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || Object.values(validationErrors).some(e => e)}
            className="submit-button w-full"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Pay ${parseFloat(formData.amount || '0').toFixed(2)}
              </span>
            )}
          </button>

          {/* Status Messages */}
          {error && (
            <div className="flex items-center gap-3 bg-red-500/20 border border-red-400/30 text-red-200 p-4 rounded-xl animate-fadeIn">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-400/30 text-green-200 p-4 rounded-xl animate-fadeIn">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{success}</span>
              </div>
              <div className="text-xs text-green-300/80 ml-8">
                Transaction ID: <span className="font-mono">{transactionId}</span>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="mt-3 ml-8 text-xs text-green-300 hover:text-white underline transition-colors"
              >
                Make another payment
              </button>
            </div>
          )}
        </form>

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full text-white/70 text-sm flex items-center justify-center gap-2 hover:text-white transition-colors"
            >
              <svg className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Recent Transactions ({recentTransactions.length})
            </button>

            {showHistory && (
              <div className="mt-3 glass-card rounded-xl p-4 space-y-2 animate-fadeIn">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                    <div>
                      <div className="text-white text-sm font-medium">${parseFloat(tx.amount).toFixed(2)}</div>
                      <div className="text-white/50 text-xs">{tx.date}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 text-xs px-2 py-1 bg-green-500/20 rounded-full">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Security Badges */}
        <div className="mt-6 flex items-center justify-center gap-6 text-white/40">
          <div className="flex items-center gap-1.5 text-xs">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>256-bit SSL</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>PCI Compliant</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Verified</span>
          </div>
        </div>
      </div>
    </main>
  );
}
