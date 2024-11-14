const express = require('express');
const router = express.Router();
const { processPayment, getTransactions, getTransaction, refundTransaction } = require('../controllers/transaction.controller');

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Process a payment
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cardNumber, expirationDate, cvv2, email, phoneNumber, cardholderName]
 *             properties:
 *               cardNumber: { type: string }
 *               expirationDate: { type: string }
 *               cvv2: { type: string }
 *               email: { type: string }
 *               phoneNumber: { type: string }
 *               cardholderName: { type: string }
 *               amount: { type: number, default: 100 }
 *               currency: { type: string, default: "USD" }
 */
router.post('/', processPayment);
router.get('/', getTransactions);
router.get('/:id', getTransaction);
router.post('/:id/refund', refundTransaction);

module.exports = router;
