const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  idempotencyKey: {
    type: String,
    sparse: true,
    index: true,
  },
  cardNumber: String,
  cardType: String,
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  status: {
    type: String,
    enum: ['succeeded', 'failed', 'refunded'],
    required: true,
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
  },
  email: String, // Stored encrypted
  phoneNumber: String, // Stored encrypted
  cardholderName: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  refundedAt: Date,
});

module.exports = mongoose.model('Transaction', transactionSchema);
