const db = require('../config/db');
const stripeService = require('../services/stripeService');

// Handle Stripe webhook events
const handleStripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripeService.constructWebhookEvent(req.body, signature);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Handle successful checkout
const handleCheckoutComplete = async (session) => {
  const { userId, tier } = session.metadata;
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  if (!userId || !tier) {
    console.error('Missing metadata in checkout session');
    return;
  }

  // Get subscription details
  const subscription = await stripeService.getSubscription(subscriptionId);

  // Upsert subscription record
  await db.query(`
    INSERT INTO subscriptions (
      user_id, tier, stripe_customer_id, stripe_subscription_id, 
      status, current_period_start, current_period_end
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (user_id) DO UPDATE SET
      tier = $2,
      stripe_customer_id = $3,
      stripe_subscription_id = $4,
      status = $5,
      current_period_start = $6,
      current_period_end = $7,
      updated_at = NOW()
  `, [
    userId,
    tier,
    customerId,
    subscriptionId,
    subscription.status,
    new Date(subscription.current_period_start * 1000),
    new Date(subscription.current_period_end * 1000),
  ]);

  // Update user's subscription tier
  await db.query(
    'UPDATE users SET subscription_tier = $2, updated_at = NOW() WHERE id = $1',
    [userId, tier]
  );

  console.log(`Subscription activated for user ${userId}: ${tier}`);
};

// Handle subscription updates
const handleSubscriptionUpdate = async (subscription) => {
  const { userId, tier } = subscription.metadata;

  if (!userId) {
    // Try to find user by customer ID
    const result = await db.query(
      'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1',
      [subscription.id]
    );
    if (!result.rows[0]) {
      console.error('Could not find user for subscription:', subscription.id);
      return;
    }
  }

  const targetUserId = userId || (await db.query(
    'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1',
    [subscription.id]
  )).rows[0]?.user_id;

  if (!targetUserId) return;

  // Map Stripe status to our status
  let status = subscription.status;
  if (subscription.cancel_at_period_end) {
    status = 'cancelled';
  }

  await db.query(`
    UPDATE subscriptions SET
      status = $2,
      current_period_start = $3,
      current_period_end = $4,
      updated_at = NOW()
    WHERE stripe_subscription_id = $1
  `, [
    subscription.id,
    status,
    new Date(subscription.current_period_start * 1000),
    new Date(subscription.current_period_end * 1000),
  ]);

  console.log(`Subscription updated: ${subscription.id}, status: ${status}`);
};

// Handle subscription deletion
const handleSubscriptionDeleted = async (subscription) => {
  const result = await db.query(
    'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1',
    [subscription.id]
  );

  if (!result.rows[0]) {
    console.error('Could not find subscription:', subscription.id);
    return;
  }

  const userId = result.rows[0].user_id;

  // Update subscription status
  await db.query(`
    UPDATE subscriptions SET status = 'cancelled', updated_at = NOW()
    WHERE stripe_subscription_id = $1
  `, [subscription.id]);

  // Downgrade user to free tier
  await db.query(
    "UPDATE users SET subscription_tier = 'free', updated_at = NOW() WHERE id = $1",
    [userId]
  );

  console.log(`Subscription cancelled for user ${userId}`);
};

// Handle failed payment
const handlePaymentFailed = async (invoice) => {
  const subscriptionId = invoice.subscription;

  if (!subscriptionId) return;

  await db.query(`
    UPDATE subscriptions SET status = 'past_due', updated_at = NOW()
    WHERE stripe_subscription_id = $1
  `, [subscriptionId]);

  console.log(`Payment failed for subscription: ${subscriptionId}`);
};

module.exports = {
  handleStripeWebhook,
};



