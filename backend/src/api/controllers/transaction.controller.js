const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const { calculateRiskScore, getRiskLevel, shouldDeclineTransaction } = require('../services/fraudDetection');
const { getCardIssuer } = require('../services/cardIssuer');
const { sendWebhook } = require('../services/webhookService');
const { encryptPII } = require('../../utils/encryption');

const processPayment = async (req, res) => {
  try {
    const { cardNumber, expirationDate, cvv2, email, phoneNumber, cardholderName, amount = 100, currency = 'USD', idempotencyKey } = req.body;

    // Check for existing transaction with same idempotency key
    if (idempotencyKey) {
      const existingTransaction = await Transaction.findOne({
        idempotencyKey,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24 hour window
      });

      if (existingTransaction) {
        // Return the existing transaction instead of creating a new one
        return res.json({
          success: existingTransaction.status === 'succeeded',
          transactionId: existingTransaction.transactionId,
          amount: existingTransaction.amount,
          currency: existingTransaction.currency,
          status: existingTransaction.status,
          riskScore: existingTransaction.riskScore,
          riskLevel: existingTransaction.riskLevel,
          cardType: existingTransaction.cardType,
        });
      }
    }

    const riskScore = calculateRiskScore({ cardNumber, email, phoneNumber, amount });
    const riskLevel = getRiskLevel(riskScore);
    const shouldDecline = shouldDeclineTransaction(riskScore);

    const transactionId = `txn_${crypto.randomUUID()}`;
    const cardType = getCardIssuer(cardNumber);
    const status = shouldDecline ? 'failed' : 'succeeded';

    // Validate and clean card number before masking
    if (!cardNumber) {
      return res.status(400).json({ success: false, message: 'Card number is required' });
    }
    const cleanedCardNumber = cardNumber.replace(/\s/g, '');
    if (cleanedCardNumber.length < 13 || cleanedCardNumber.length > 19) {
      return res.status(400).json({ success: false, message: 'Invalid card number length' });
    }

    const transaction = await Transaction.create({
      transactionId,
      idempotencyKey,
      cardNumber: cleanedCardNumber.substring(0, 6) + '******' + cleanedCardNumber.slice(-4),
      cardType,
      amount,
      currency,
      status,
      riskScore,
      riskLevel,
      email: encryptPII(email),
      phoneNumber: encryptPII(phoneNumber),
      cardholderName,
    });

    // Send webhook
    await sendWebhook(`payment.${status}`, transaction);

    if (shouldDecline) {
      return res.status(402).json({
        success: false,
        message: 'Payment declined due to high risk',
        transactionId,
        riskScore,
        riskLevel,
      });
    }

    res.json({
      success: true,
      transactionId,
      amount,
      currency,
      status,
      riskScore,
      riskLevel,
      cardType,
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ success: false, message: 'Payment processing failed' });
  }
};

const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Transaction.countDocuments();

    res.json({
      transactions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve transactions' });
  }
};

const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ transactionId: req.params.id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve transaction' });
  }
};

const refundTransaction = async (req, res) => {
  try {
    // Atomic update: only refund if status is 'succeeded'
    const transaction = await Transaction.findOneAndUpdate(
      {
        transactionId: req.params.id,
        status: 'succeeded' // Only update if still in succeeded state
      },
      {
        status: 'refunded',
        refundedAt: new Date()
      },
      { new: true } // Return updated document
    );

    if (!transaction) {
      // Could be not found or already refunded
      const existingTransaction = await Transaction.findOne({ transactionId: req.params.id });
      if (!existingTransaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }
      return res.status(400).json({ success: false, message: 'Transaction already refunded or not refundable' });
    }

    await sendWebhook('payment.refunded', transaction);

    res.json({ success: true, message: 'Transaction refunded', transaction });
  } catch (error) {
    console.error('Refund transaction error:', error);
    res.status(500).json({ success: false, message: 'Failed to refund transaction' });
  }
};

module.exports = {
  processPayment,
  getTransactions,
  getTransaction,
  refundTransaction,
};
