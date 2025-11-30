const mongoose = require('mongoose');
const { WEBHOOK_EVENT_VALUES } = require('../../constants/webhooks');

const webhookConfigSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        try {
          const parsed = new URL(v);
          return ['http:', 'https:'].includes(parsed.protocol);
        } catch {
          return false;
        }
      },
      message: 'URL must be a valid HTTP or HTTPS URL'
    }
  },
  events: {
    type: [{
      type: String,
      enum: WEBHOOK_EVENT_VALUES,
    }],
    required: true,
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: 'At least one event must be specified'
    }
  },
  secret: {
    type: String,
    required: true,
    select: false, // Exclude from queries to prevent exposure
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('WebhookConfig', webhookConfigSchema);
