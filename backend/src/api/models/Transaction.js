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
  cardNumber: {
    type: String,
    validate: {
      validator: function (v) {
        // Ensure format is 6 digits + ****** + 4 digits (or empty/null)
        return !v || /^\d{6}\*{6}\d{4}$/.test(v);
      },
      message: 'cardNumber must be in masked format (XXXXXX******XXXX) or empty'
    }
  },
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
    enum: ['pending', 'processing', 'succeeded', 'failed', 'refunded'],
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
  email: {
    type: String,
    validate: {
      validator: function (v) {
        // Must be encrypted in hex format: iv:authTag:ciphertext
        return !v || /^[a-f0-9]+:[a-f0-9]+:[a-f0-9]+$/.test(v);
      },
      message: 'email must be encrypted in iv:authTag:ciphertext format'
    },
    select: false, // Exclude from queries by default
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: function (v) {
        // Must be encrypted in hex format: iv:authTag:ciphertext
        return !v || /^[a-f0-9]+:[a-f0-9]+:[a-f0-9]+$/.test(v);
      },
      message: 'phoneNumber must be encrypted in iv:authTag:ciphertext format'
    },
    select: false, // Exclude from queries by default
  },
  cardholderName: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  refundedAt: Date,
});

module.exports = mongoose.model('Transaction', transactionSchema);
