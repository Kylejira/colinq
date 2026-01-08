const db = require('../config/db');
const matchingService = require('../services/matchingService');

// Get profiles to discover/swipe on
const getDiscoverProfiles = async (req, res) => {
  try {
    const { clerkUserId } = req;
    
    // Get user ID from clerk ID
    const userResult = await db.query(
      'SELECT id, subscription_tier FROM users WHERE clerk_id = $1',
      [clerkUserId]
    );

    if (!userResult.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    const { niche, minFollowers, maxFollowers, minEngagement, location } = req.query;

    // Check daily view limit for free tier
    if (user.subscription_tier === 'free') {
      const today = new Date().toISOString().split('T')[0];
      const usageResult = await db.query(`
        SELECT count FROM usage_tracking 
        WHERE user_id = $1 AND action_type = 'profile_view' AND period_start = $2
      `, [user.id, today]);

      const currentViews = usageResult.rows[0]?.count || 0;
      if (currentViews >= 10) {
        return res.status(403).json({ 
          error: 'Daily limit reached',
          message: 'Free users can view 10 profiles per day. Upgrade to Pro for unlimited.',
          upgradeRequired: true
        });
      }
    }

    // Get discover profiles with filters
    const profiles = await matchingService.getDiscoverProfiles(
      user.id,
      { niche, minFollowers, maxFollowers, minEngagement, location },
      10
    );

    // Add match reasons to each profile
    const profilesWithReasons = await Promise.all(
      profiles.map(async (profile) => {
        const matchReasons = await matchingService.getMatchReason(user.id, profile.id);
        return { ...profile, match_reasons: matchReasons };
      })
    );

    res.json(profilesWithReasons);
  } catch (error) {
    console.error('Get discover profiles error:', error);
    res.status(500).json({ error: 'Failed to get profiles' });
  }
};

// Record a swipe action
const createSwipe = async (req, res) => {
  try {
    const { clerkUserId } = req;
    const { targetId, action } = req.body;

    if (!targetId || !action) {
      return res.status(400).json({ error: 'targetId and action are required' });
    }

    if (!['like', 'pass', 'superlike', 'save'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    // Get user ID
    const userResult = await db.query(
      'SELECT id, subscription_tier FROM users WHERE clerk_id = $1',
      [clerkUserId]
    );

    if (!userResult.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Track profile view for free tier
    if (user.subscription_tier === 'free') {
      const today = new Date().toISOString().split('T')[0];
      await db.query(`
        INSERT INTO usage_tracking (user_id, action_type, count, period_start, period_end)
        VALUES ($1, 'profile_view', 1, $2, $2)
        ON CONFLICT (user_id, action_type, period_start)
        DO UPDATE SET count = usage_tracking.count + 1
      `, [user.id, today]);
    }

    // Record the swipe
    await db.query(`
      INSERT INTO swipes (user_id, target_id, action)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, target_id)
      DO UPDATE SET action = $3, created_at = NOW()
    `, [user.id, targetId, action]);

    // Check for mutual like (match)
    let match = null;
    if (action === 'like' || action === 'superlike') {
      const isMutual = await matchingService.checkMutualLike(user.id, targetId);
      
      if (isMutual) {
        match = await matchingService.createMatch(user.id, targetId);
        
        if (match) {
          // Get matched user details for response
          const matchedUserResult = await db.query(`
            SELECT id, display_name, profile_photo_url 
            FROM users WHERE id = $1
          `, [targetId]);
          
          match.matched_user = matchedUserResult.rows[0];
        }
      }
    }

    res.json({ 
      success: true, 
      action,
      match: match ? {
        id: match.id,
        matched_user: match.matched_user,
        created_at: match.created_at
      } : null
    });
  } catch (error) {
    console.error('Create swipe error:', error);
    res.status(500).json({ error: 'Failed to record swipe' });
  }
};

// Get saved profiles
const getSavedProfiles = async (req, res) => {
  try {
    const { clerkUserId } = req;

    const result = await db.query(`
      SELECT 
        u.id,
        u.display_name,
        u.bio,
        u.profile_photo_url,
        u.location,
        u.verification_status,
        s.created_at as saved_at,
        json_agg(
          json_build_object(
            'platform_name', p.platform_name,
            'follower_count', p.follower_count,
            'engagement_rate', p.engagement_rate,
            'niche', p.niche
          )
        ) FILTER (WHERE p.id IS NOT NULL) as platforms
      FROM swipes s
      JOIN users u ON s.target_id = u.id
      JOIN users me ON s.user_id = me.id
      LEFT JOIN platforms p ON u.id = p.user_id
      WHERE me.clerk_id = $1 AND s.action = 'save'
      GROUP BY u.id, s.created_at
      ORDER BY s.created_at DESC
    `, [clerkUserId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get saved profiles error:', error);
    res.status(500).json({ error: 'Failed to get saved profiles' });
  }
};

module.exports = {
  getDiscoverProfiles,
  createSwipe,
  getSavedProfiles,
};

