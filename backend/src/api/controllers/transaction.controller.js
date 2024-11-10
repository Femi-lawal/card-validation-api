const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const { calculateRiskScore, getRiskLevel, shouldDeclineTransaction } = require('../services/fraudDetection');
const { getCardIssuer } = require('../services/cardIssuer');
const { sendWebhook } = require('../services/webhookService');

const processPayment = async (req, res) => {
  try {
    const { cardNumber, expirationDate, cvv2, email, phoneNumber, cardholderName, amount = 100, currency = 'USD' } = req.body;

    const riskScore = calculateRiskScore({ cardNumber, email, phoneNumber, amount });
    const riskLevel = getRiskLevel(riskScore);
    const shouldDecline = shouldDeclineTransaction(riskScore);

    const transactionId = `txn_${crypto.randomUUID()}`;
    const cardType = getCardIssuer(cardNumber);
    const status = shouldDecline ? 'failed' : 'succeeded';

    const transaction = await Transaction.create({
      transactionId,
      cardNumber: cardNumber.substring(0, 6) + '******' + cardNumber.slice(-4),
      cardType,
      amount,
      currency,
      status,
      riskScore,
      riskLevel,
      email,
      phoneNumber,
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
    res.status(500).json({ success: false, message: error.message });
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
    res.status(500).json({ success: false, message: error.message });
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
    res.status(500).json({ success: false, message: error.message });
  }
};

const refundTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ transactionId: req.params.id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.status !== 'succeeded') {
      return res.status(400).json({ success: false, message: 'Only successful transactions can be refunded' });
    }

    transaction.status = 'refunded';
    transaction.refundedAt = new Date();
    await transaction.save();

    await sendWebhook('payment.refunded', transaction);

    res.json({ success: true, message: 'Transaction refunded', transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  processPayment,
  getTransactions,
  getTransaction,
  refundTransaction,
};
