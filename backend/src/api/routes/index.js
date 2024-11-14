const express = require('express');
const router = express.Router();

router.use('/v1/cards', require('./card.routes'));
router.use('/transactions', require('./transaction.routes'));
router.use('/analytics', require('./analytics.routes'));
router.use('/webhooks', require('./webhook.routes'));

module.exports = router;
