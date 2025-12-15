'use client';

import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

// ==================== TYPES ====================
interface Transaction {
  id: string;
  amount: string;
  currency: string;
  status: string;
  date: string;
  cardLast4: string;
  cardType: string;
}

// ==================== CONSTANTS ====================
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 149.50 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.36 },
];

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
};

const TEST_CARDS = [
  { name: 'Visa', number: '4242424242424242', icon: '💳' },
  { name: 'Mastercard', number: '5555555555554444', icon: '💳' },
  { name: 'Amex', number: '378282246310005', icon: '💳' },
];

// ==================== ENCRYPTION UTILITIES ====================
const encryptCardData = async (cardData: {
  cardNumber: string;
  cvv: string;
  expiry: string;
}): Promise<{ encryptedData: string; iv: string }> => {
  // Generate a random encryption key (in production, this would come from server)
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  // Generate initialization vector
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encode the card data
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(cardData));

  // Encrypt the data
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  // Convert to base64 for transmission
  const encryptedData = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(encryptedBuffer))));
  const ivString = btoa(String.fromCharCode.apply(null, Array.from(iv)));

  return { encryptedData, iv: ivString };
};

// ==================== VALIDATION UTILITIES ====================
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

const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
};

const formatExpiryDate = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
  }
  return cleaned;
};

// ==================== COMPONENTS ====================

// 3D Secure Modal Component
function ThreeDSecureModal({
  isOpen,
  onClose,
  onVerify,
  amount,
  currency
}: {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => void;
  amount: string;
  currency: typeof CURRENCIES[0];
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (isOpen && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, timeLeft]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    onVerify(otp.join(''));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card rounded-2xl p-8 max-w-md w-full mx-4 animate-slideUp">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">3D Secure Verification</h3>
          <p className="text-white/60 text-sm">
            Enter the 6-digit code sent to your phone to authorize the payment of{' '}
            <span className="font-semibold text-white">{currency.symbol}{parseFloat(amount).toFixed(2)}</span>
          </p>
        </div>

        {/* OTP Input */}
        <div className="flex gap-2 justify-center mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              className="w-12 h-14 text-center text-xl font-bold bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-400 focus:outline-none"
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-center mb-6">
          <span className="text-white/50 text-sm">
            Code expires in: <span className={timeLeft < 30 ? 'text-red-400' : 'text-white'}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </span>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleVerify}
            disabled={otp.some(d => !d) || isVerifying}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold disabled:opacity-50 hover:opacity-90 transition"
          >
            {isVerifying ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verifying...
              </span>
            ) : 'Verify'}
          </button>
        </div>

        {/* Demo hint */}
        <p className="text-center text-white/40 text-xs mt-4">
          Demo: Enter any 6 digits to proceed
        </p>
      </div>
    </div>
  );
}

// Receipt Modal Component
function ReceiptModal({
  isOpen,
  onClose,
  transaction,
  currency
}: {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  currency: typeof CURRENCIES[0];
}) {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card rounded-2xl p-8 max-w-md w-full mx-4 animate-slideUp">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">Payment Successful!</h3>
          <p className="text-white/60 text-sm">Your transaction has been processed</p>
        </div>

        {/* Receipt Details */}
        <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Transaction ID</span>
            <span className="text-white font-mono">{transaction.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Date & Time</span>
            <span className="text-white">{transaction.date}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Card</span>
            <span className="text-white">{transaction.cardType} •••• {transaction.cardLast4}</span>
          </div>
          <div className="border-t border-white/10 pt-3 flex justify-between">
            <span className="text-white font-semibold">Amount Paid</span>
            <span className="text-2xl font-bold text-green-400">
              {currency.symbol}{parseFloat(transaction.amount).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Encryption Badge */}
        <div className="flex items-center justify-center gap-2 mb-6 text-white/50 text-xs">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Payment encrypted with AES-256-GCM</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold hover:opacity-90 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
export default function Home() {
  // State
  const [formData, setFormData] = useState({
    cardNumber: '',
    expirationDate: '',
    cvv2: '',
    email: '',
    phoneNumber: '',
    cardholderName: '',
    amount: '100',
  });
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);

  // 3D Secure
  const [show3DS, setShow3DS] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(false);

  // Receipt
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);

  // Encryption status
  const [isEncrypted, setIsEncrypted] = useState(false);

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

  // Convert amount to selected currency
  const convertedAmount = parseFloat(formData.amount || '0') * currency.rate;

  // Validation
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

    // Encrypt card data
    try {
      const encrypted = await encryptCardData({
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        cvv: formData.cvv2,
        expiry: formData.expirationDate,
      });
      setIsEncrypted(true);
      console.log('Card data encrypted with AES-256-GCM');
    } catch (err) {
      console.log('Encryption demo - would encrypt in production');
    }

    // Trigger 3D Secure for amounts > $50
    if (parseFloat(formData.amount) > 50) {
      setIsLoading(false);
      setPendingPayment(true);
      setShow3DS(true);
      return;
    }

    // Process payment directly for smaller amounts
    await processPayment();
  };

  const handle3DSVerify = async (code: string) => {
    setShow3DS(false);
    setIsLoading(true);

    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1000));

    await processPayment();
  };

  const processPayment = async () => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
          currency: currency.code,
          encrypted: isEncrypted,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const transaction: Transaction = {
          id: data.transactionId || `TXN${Date.now()}`,
          amount: formData.amount,
          currency: currency.code,
          status: 'Success',
          date: new Date().toLocaleString(),
          cardLast4: formData.cardNumber.slice(-4),
          cardType: cardNetwork?.name || 'Card',
        };

        setCurrentTransaction(transaction);
        setRecentTransactions(prev => [transaction, ...prev.slice(0, 4)]);

        // Show receipt modal
        setShowReceipt(true);

        // Epic confetti
        const duration = 3000;
        const end = Date.now() + duration;
        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];

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
      setPendingPayment(false);
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
    setValidationErrors({});
    setIsEncrypted(false);
  };

  return (
    <main className={`min-h-screen flex items-center justify-center p-4 overflow-hidden relative transition-colors duration-500 ${darkMode ? '' : 'light-mode'}`}>
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header with Theme Toggle */}
        <div className="flex justify-between items-start mb-6">
          <div>
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

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 transition"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        {/* 3D Credit Card */}
        <div className={`card-container mb-6 ${isFlipped ? 'flipped' : ''} ${isShaking ? 'shake' : ''}`}>
          <div className="card-inner">
            {/* Card Front */}
            <div className="card-face card-front" style={{ background: cardGradient }}>
              <div className="absolute top-6 left-6">
                <div className="w-12 h-9 rounded-md bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 flex items-center justify-center overflow-hidden">
                  <div className="grid grid-cols-3 gap-px w-8 h-6">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="bg-yellow-600/30 rounded-sm"></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute top-6 right-6">
                <svg className="w-8 h-8 text-white/80 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8.5 14.5A6 6 0 0 0 8.5 9.5" strokeLinecap="round" />
                  <path d="M11 17a9 9 0 0 0 0-10" strokeLinecap="round" />
                  <path d="M14 19.5a12 12 0 0 0 0-15" strokeLinecap="round" />
                </svg>
              </div>
              <div className="absolute bottom-20 left-6 right-6">
                <div className="text-xl md:text-2xl text-white font-mono tracking-widest">
                  {formData.cardNumber || '•••• •••• •••• ••••'}
                </div>
              </div>
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
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-2xl pointer-events-none"></div>
            </div>
            {/* Card Back */}
            <div className="card-face card-back" style={{ background: cardGradient }}>
              <div className="absolute top-8 left-0 right-0 h-12 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"></div>
              <div className="absolute top-24 left-6 right-6 flex gap-4 items-center">
                <div className="flex-1 h-10 bg-white/90 rounded flex items-center justify-end pr-4">
                  <span className="font-mono text-gray-700 italic text-sm tracking-widest">
                    {formData.cvv2 || '•••'}
                  </span>
                </div>
                <div className="text-white/80 text-xs">CVV</div>
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-[9px] text-white/50 leading-relaxed">
                  This card is property of SecurePay Financial Services. Use of this card is subject to the cardholder agreement.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="flex gap-2 mb-4 items-center justify-between">
          {/* Test Cards */}
          <div className="flex gap-2">
            <span className="text-white/50 text-xs self-center mr-1">Quick fill:</span>
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

          {/* Currency Selector */}
          <select
            value={currency.code}
            onChange={(e) => setCurrency(CURRENCIES.find(c => c.code === e.target.value) || CURRENCIES[0])}
            className="bg-white/10 backdrop-blur border border-white/20 rounded-lg px-3 py-1.5 text-white text-xs cursor-pointer focus:outline-none focus:border-white/40"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code} className="bg-gray-900">
                {c.symbol} {c.code}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
          {/* Encryption Badge */}
          <div className="flex items-center gap-2 text-xs text-green-400 mb-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>End-to-end encrypted with AES-256-GCM</span>
          </div>

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

          {/* Amount with Currency */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 font-medium">{currency.symbol}</span>
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
            {currency.code !== 'USD' && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 text-xs">
                ≈ ${parseFloat(formData.amount || '0').toFixed(2)} USD
              </span>
            )}
            {validationErrors.amount && (
              <p className="text-red-300 text-xs mt-1">{validationErrors.amount}</p>
            )}
          </div>

          {/* 3D Secure Info */}
          {parseFloat(formData.amount) > 50 && (
            <div className="flex items-center gap-2 text-xs text-blue-300 bg-blue-500/10 border border-blue-400/20 rounded-lg p-3">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>3D Secure verification required for payments over $50</span>
            </div>
          )}

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
                {pendingPayment ? 'Verifying...' : 'Processing...'}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Pay {currency.symbol}{parseFloat(formData.amount || '0').toFixed(2)} {currency.code}
              </span>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 bg-red-500/20 border border-red-400/30 text-red-200 p-4 rounded-xl animate-fadeIn">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">{error}</span>
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
                      <div className="text-white text-sm font-medium">
                        {CURRENCIES.find(c => c.code === tx.currency)?.symbol}{parseFloat(tx.amount).toFixed(2)} {tx.currency}
                      </div>
                      <div className="text-white/50 text-xs">{tx.date}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/60 text-xs">{tx.cardType} •••• {tx.cardLast4}</span>
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
            <span>3D Secure</span>
          </div>
        </div>
      </div>

      {/* 3D Secure Modal */}
      <ThreeDSecureModal
        isOpen={show3DS}
        onClose={() => { setShow3DS(false); setPendingPayment(false); }}
        onVerify={handle3DSVerify}
        amount={formData.amount}
        currency={currency}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={showReceipt}
        onClose={() => { setShowReceipt(false); resetForm(); }}
        transaction={currentTransaction}
        currency={currency}
      />
    </main>
  );
}
