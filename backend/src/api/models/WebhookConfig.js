const mongoose = require('mongoose');

const webhookConfigSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  events: [{
    type: String,
    enum: ['payment.succeeded', 'payment.failed', 'payment.refunded'],
  }],
  secret: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('WebhookConfig', webhookConfigSchema);
