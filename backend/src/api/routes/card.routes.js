const express = require('express');
const router = express.Router();
const { validateCard } = require('../controllers/card.controller');

router.post('/validate', validateCard);

module.exports = router;
