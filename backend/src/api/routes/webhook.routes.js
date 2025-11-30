const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const WebhookConfig = require('../models/WebhookConfig');

router.post('/configure', async (req, res) => {
  try {
    const { url, events } = req.body;
    const secret = crypto.randomBytes(32).toString('hex');

    const config = await WebhookConfig.create({
      url,
      events,
      secret,
    });

    res.json({
      success: true,
      config: {
        id: config._id,
        url: config.url,
        events: config.events,
        secret: config.secret,
      },
    });
  } catch (error) {
    console.error('Webhook configuration error:', error);
    res.status(500).json({ success: false, message: 'Failed to configure webhook' });
  }
});

module.exports = router;
