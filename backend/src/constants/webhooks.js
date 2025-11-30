/**
 * Webhook event constants
 * Used across models, validators, and controllers to ensure consistency
 */
const WEBHOOK_EVENTS = {
    PAYMENT_SUCCEEDED: 'payment.succeeded',
    PAYMENT_FAILED: 'payment.failed',
    PAYMENT_REFUNDED: 'payment.refunded',
};

const WEBHOOK_EVENT_VALUES = Object.values(WEBHOOK_EVENTS);

module.exports = {
    WEBHOOK_EVENTS,
    WEBHOOK_EVENT_VALUES,
};
