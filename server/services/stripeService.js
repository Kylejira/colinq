const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Price IDs - these should be created in Stripe Dashboard
const PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID,
  premium: process.env.STRIPE_PREMIUM_PRICE_ID,
};

const TIER_FEATURES = {
  free: {
    profileViews: 10,
    messagesPerMonth: 3,
    advancedFilters: false,
    analytics: false,
    verifiedBadge: false,
    revenueTracking: false,
    featuredPlacement: false,
    prioritySupport: false,
  },
  pro: {
    profileViews: -1, // unlimited
    messagesPerMonth: -1, // unlimited
    advancedFilters: true,
    analytics: true,
    verifiedBadge: true,
    revenueTracking: false,
    featuredPlacement: false,
    prioritySupport: false,
  },
  premium: {
    profileViews: -1,
    messagesPerMonth: -1,
    advancedFilters: true,
    analytics: true,
    verifiedBadge: true,
    revenueTracking: true,
    featuredPlacement: true,
    prioritySupport: true,
  },
};

// Create or get Stripe customer
const getOrCreateCustomer = async (user) => {
  const db = require('../config/db');

  // Check if user already has a Stripe customer ID
  const subResult = await db.query(
    'SELECT stripe_customer_id FROM subscriptions WHERE user_id = $1',
    [user.id]
  );

  if (subResult.rows[0]?.stripe_customer_id) {
    return subResult.rows[0].stripe_customer_id;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.display_name,
    metadata: {
      userId: user.id,
    },
  });

  return customer.id;
};

// Create checkout session
const createCheckoutSession = async (user, tier, successUrl, cancelUrl) => {
  const priceId = PRICE_IDS[tier];
  
  if (!priceId) {
    throw new Error(`Invalid tier: ${tier}`);
  }

  const customerId = await getOrCreateCustomer(user);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: user.id,
      tier: tier,
    },
    subscription_data: {
      metadata: {
        userId: user.id,
        tier: tier,
      },
    },
  });

  return session;
};

// Create customer portal session
const createPortalSession = async (customerId, returnUrl) => {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
};

// Get subscription details from Stripe
const getSubscription = async (subscriptionId) => {
  return await stripe.subscriptions.retrieve(subscriptionId);
};

// Cancel subscription
const cancelSubscription = async (subscriptionId) => {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
};

// Resume subscription (undo cancel)
const resumeSubscription = async (subscriptionId) => {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
};

// Construct webhook event
const constructWebhookEvent = (payload, signature) => {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
};

module.exports = {
  stripe,
  PRICE_IDS,
  TIER_FEATURES,
  getOrCreateCustomer,
  createCheckoutSession,
  createPortalSession,
  getSubscription,
  cancelSubscription,
  resumeSubscription,
  constructWebhookEvent,
};

