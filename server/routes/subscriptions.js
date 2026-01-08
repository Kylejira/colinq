const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { requireAuth } = require('../middleware/auth');

// GET /api/subscriptions/status - Get subscription status
router.get('/status', requireAuth, subscriptionController.getSubscriptionStatus);

// POST /api/subscriptions/checkout - Create checkout session
router.post('/checkout', requireAuth, subscriptionController.createCheckout);

// GET /api/subscriptions/portal - Get customer portal URL
router.get('/portal', requireAuth, subscriptionController.getPortalUrl);

// GET /api/subscriptions/usage - Get usage stats
router.get('/usage', requireAuth, subscriptionController.getUsageStats);

module.exports = router;

