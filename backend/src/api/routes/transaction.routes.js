const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const validate = require('../../middleware/validate');
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
router.post('/', [
    body('cardNumber').isString().notEmpty().withMessage('Card number is required'),
    body('expirationDate').matches(/^(0[1-9]|1[0-2])\/\d{2}$/).withMessage('Invalid expiration date format (MM/YY)'),
    body('cvv2').isString().matches(/^\d{3,4}$/).withMessage('CVV must be 3 or 4 digits'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phoneNumber').matches(/^\+?[1-9]\d{1,14}$/).withMessage('Valid phone number is required'),
    body('cardholderName').isString().notEmpty().withMessage('Cardholder name is required'),
    body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
    body('currency').optional().isString().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
    body('idempotencyKey').optional().isString().notEmpty().withMessage('Idempotency key must be a valid string'),
    validate
], processPayment);

router.get('/', [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    validate
], getTransactions);

router.get('/:id', [
    param('id').isString().notEmpty().withMessage('Transaction ID is required'),
    validate
], getTransaction);

router.post('/:id/refund', [
    param('id').isString().notEmpty().withMessage('Transaction ID is required'),
    validate
], refundTransaction);

module.exports = router;
