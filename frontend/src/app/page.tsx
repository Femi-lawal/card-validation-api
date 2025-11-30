'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';

const CARD_NETWORKS = {
  visa: { color: '#1A1F71', logo: '💳', regex: /^4/ },
  mastercard: { color: '#EB001B', logo: '💳', regex: /^5[1-5]/ },
  amex: { color: '#006FCF', logo: '💳', regex: /^3[47]/ },
  discover: { color: '#FF6000', logo: '💳', regex: /^6(?:011|5)/ },
  jcb: { color: '#0B4EA2', logo: '💳', regex: /^35/ },
  diners: { color: '#0079BE', logo: '💳', regex: /^3(?:0[0-5]|[68])/ },
  maestro: { color: '#EC1C24', logo: '💳', regex: /^(?:5[06789]|6)/ },
  unionpay: { color: '#E21836', logo: '💳', regex: /^62/ },
};

const TEST_CARDS = [
  { name: 'Visa', number: '4242424242424242' },
  { name: 'Mastercard', number: '5555555555554444' },
  { name: 'Amex', number: '378282246310005' },
];

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

  const detectCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    for (const [type, data] of Object.entries(CARD_NETWORKS)) {
      if (data.regex.test(cleaned)) return type;
    }
    return null;
  };

  const cardType = detectCardType(formData.cardNumber);
  const cardColor = cardType ? CARD_NETWORKS[cardType as keyof typeof CARD_NETWORKS].color : '#667eea';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(`Payment successful! Transaction ID: ${data.transactionId}`);
        setTransactionId(data.transactionId);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else {
        setError(data.message || 'Payment failed');
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const fillTestCard = (card: typeof TEST_CARDS[0]) => {
    setFormData({
      ...formData,
      cardNumber: card.number,
      expirationDate: '12/25',
      cvv2: card.name === 'Amex' ? '1234' : '123',
      cardholderName: 'Test User',
      email: 'test@example.com',
      phoneNumber: '+14155552671',
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">Payment Gateway</h1>

        {/* Card Display */}
        <div className={`card-container mb-8 perspective-1000 ${isFlipped ? 'flipped' : ''} ${isShaking ? 'shake' : ''}`}>
          <div className="card-flip w-full h-56 relative" style={{ transformStyle: 'preserve-3d' }}>
            <div
              className="absolute w-full h-full rounded-2xl p-6 flex flex-col justify-between"
              style={{
                background: `linear-gradient(135deg, ${cardColor} 0%, ${cardColor}dd 100%)`,
                backfaceVisibility: 'hidden',
              }}
            >
              <div className="text-white text-2xl">{cardType || '💳'}</div>
              <div className="text-white text-xl tracking-wider font-mono">
                {formData.cardNumber || '•••• •••• •••• ••••'}
              </div>
              <div className="flex justify-between text-white">
                <span>{formData.cardholderName || 'CARD HOLDER'}</span>
                <span>{formData.expirationDate || 'MM/YY'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Test Cards */}
        <div className="flex gap-2 mb-4 justify-center">
          {TEST_CARDS.map((card) => (
            <button
              key={card.name}
              onClick={() => fillTestCard(card)}
              className="glass px-3 py-2 rounded-lg text-white text-sm hover:bg-white hover:bg-opacity-20 transition"
            >
              {card.name}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
          <input
            type="text"
            placeholder="Card Number"
            value={formData.cardNumber}
            onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
            className="w-full bg-white bg-opacity-20 text-white placeholder-gray-300 px-4 py-3 rounded-lg"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="MM/YY"
              value={formData.expirationDate}
              onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
              className="bg-white bg-opacity-20 text-white placeholder-gray-300 px-4 py-3 rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="CVV"
              value={formData.cvv2}
              onFocus={() => setIsFlipped(true)}
              onBlur={() => setIsFlipped(false)}
              onChange={(e) => setFormData({ ...formData, cvv2: e.target.value })}
              className="bg-white bg-opacity-20 text-white placeholder-gray-300 px-4 py-3 rounded-lg"
              required
            />
          </div>

          <input
            type="text"
            placeholder="Cardholder Name"
            value={formData.cardholderName}
            onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
            className="w-full bg-white bg-opacity-20 text-white placeholder-gray-300 px-4 py-3 rounded-lg"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-white bg-opacity-20 text-white placeholder-gray-300 px-4 py-3 rounded-lg"
            required
          />

          <input
            type="tel"
            placeholder="Phone (+1234567890)"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="w-full bg-white bg-opacity-20 text-white placeholder-gray-300 px-4 py-3 rounded-lg"
            required
          />

          <input
            type="number"
            placeholder="Amount (USD)"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full bg-white bg-opacity-20 text-white placeholder-gray-300 px-4 py-3 rounded-lg"
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-purple-900 font-bold py-3 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : `Pay $${formData.amount}`}
          </button>

          {error && <div className="text-red-300 text-center bg-red-500 bg-opacity-20 p-3 rounded-lg">{error}</div>}
          {success && <div className="text-green-300 text-center bg-green-500 bg-opacity-20 p-3 rounded-lg">{success}</div>}
        </form>
      </div>
    </main>
  );
}
