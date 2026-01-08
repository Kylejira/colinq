const db = require('../config/db');
const stripeService = require('../services/stripeService');

// Get current subscription status
const getSubscriptionStatus = async (req, res) => {
  try {
    const { clerkUserId } = req;

    const result = await db.query(`
      SELECT 
        u.id,
        u.subscription_tier,
        s.stripe_customer_id,
        s.stripe_subscription_id,
        s.status,
        s.current_period_start,
        s.current_period_end,
        s.tier as subscription_tier_detail
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      WHERE u.clerk_id = $1
    `, [clerkUserId]);

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const features = stripeService.TIER_FEATURES[user.subscription_tier] || stripeService.TIER_FEATURES.free;

    res.json({
      tier: user.subscription_tier,
      status: user.status || 'active',
      features,
      currentPeriodEnd: user.current_period_end,
      hasActiveSubscription: !!user.stripe_subscription_id && user.status === 'active',
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
};

// Create checkout session
const createCheckout = async (req, res) => {
  try {
    const { clerkUserId } = req;
    const { tier } = req.body;

    if (!['pro', 'premium'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    // Get user
    const userResult = await db.query(
      'SELECT id, email, display_name FROM users WHERE clerk_id = $1',
      [clerkUserId]
    );

    if (!userResult.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    const session = await stripeService.createCheckoutSession(
      user,
      tier,
      `${clientUrl}/subscription?success=true`,
      `${clientUrl}/subscription?canceled=true`
    );

    res.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Create checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

// Get customer portal URL
const getPortalUrl = async (req, res) => {
  try {
    const { clerkUserId } = req;

    // Get subscription with customer ID
    const result = await db.query(`
      SELECT s.stripe_customer_id
      FROM users u
      JOIN subscriptions s ON u.id = s.user_id
      WHERE u.clerk_id = $1 AND s.stripe_customer_id IS NOT NULL
    `, [clerkUserId]);

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const session = await stripeService.createPortalSession(
      result.rows[0].stripe_customer_id,
      `${clientUrl}/subscription`
    );

    res.json({ portalUrl: session.url });
  } catch (error) {
    console.error('Get portal URL error:', error);
    res.status(500).json({ error: 'Failed to get portal URL' });
  }
};

// Get usage stats for current period
const getUsageStats = async (req, res) => {
  try {
    const { clerkUserId } = req;

    const userResult = await db.query(
      'SELECT id, subscription_tier FROM users WHERE clerk_id = $1',
      [clerkUserId]
    );

    if (!userResult.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    const today = new Date().toISOString().split('T')[0];
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get profile views today
    const viewsResult = await db.query(`
      SELECT COALESCE(count, 0) as count
      FROM usage_tracking
      WHERE user_id = $1 AND action_type = 'profile_view' AND period_start = $2
    `, [user.id, today]);

    // Get messages this month
    const messagesResult = await db.query(`
      SELECT COUNT(*)::int as count
      FROM messages
      WHERE sender_id = $1 AND created_at >= $2
    `, [user.id, startOfMonth.toISOString()]);

    const features = stripeService.TIER_FEATURES[user.subscription_tier] || stripeService.TIER_FEATURES.free;

    res.json({
      profileViews: {
        used: viewsResult.rows[0]?.count || 0,
        limit: features.profileViews,
        unlimited: features.profileViews === -1,
      },
      messages: {
        used: messagesResult.rows[0]?.count || 0,
        limit: features.messagesPerMonth,
        unlimited: features.messagesPerMonth === -1,
      },
    });
  } catch (error) {
    console.error('Get usage stats error:', error);
    res.status(500).json({ error: 'Failed to get usage stats' });
  }
};

module.exports = {
  getSubscriptionStatus,
  createCheckout,
  getPortalUrl,
  getUsageStats,
};



