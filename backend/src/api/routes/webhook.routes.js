const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { body } = require('express-validator');
const WebhookConfig = require('../models/WebhookConfig');
const validate = require('../../middleware/validate');
const authorize = require('../../middleware/authorize');
const { WEBHOOK_EVENT_VALUES } = require('../../constants/webhooks');

router.post(
  '/configure',
  authorize,
  [
    body('url').isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('Valid HTTP/HTTPS URL required'),
    body('events').isArray({ min: 1 }).withMessage('At least one event must be specified'),
    body('events.*').isIn(WEBHOOK_EVENT_VALUES).withMessage('Invalid event type'),
    validate,
  ],
  async (req, res) => {
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
