const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// POST /api/webhooks/stripe - Handle Stripe webhooks
// Note: This route needs raw body, not JSON parsed
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  webhookController.handleStripeWebhook
);

module.exports = router;



