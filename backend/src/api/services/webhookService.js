const crypto = require('crypto');
const WebhookConfig = require('../models/WebhookConfig');

const generateSignature = (payload, secret) => {
  return crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
};

const sendWebhook = async (event, data) => {
  try {
    const configs = await WebhookConfig.find({ events: event, active: true });

    for (const config of configs) {
      const payload = {
        event,
        data,
        timestamp: new Date().toISOString(),
      };

      const signature = generateSignature(payload, config.secret);

      // In production, use a proper HTTP client
      console.log(`Webhook sent to ${config.url}:`, payload);
      console.log(`Signature: ${signature}`);
    }
  } catch (error) {
    console.error('Webhook error:', error);
  }
};

module.exports = {
  sendWebhook,
};
