const db = require('../config/db');
const youtubeService = require('../services/youtubeService');

// Sync user from Clerk to our database
const syncUser = async (req, res) => {
  try {
    const { clerkUserId } = req;
    const { email, displayName, profilePhotoUrl } = req.body;

    // Check if user exists
    const existingUser = await db.query(
      'SELECT * FROM users WHERE clerk_id = $1',
      [clerkUserId]
    );

    if (existingUser.rows[0]) {
      // Update existing user
      const result = await db.query(
        `UPDATE users 
         SET email = $2, display_name = $3, profile_photo_url = $4, updated_at = NOW()
         WHERE clerk_id = $1
         RETURNING *`,
        [clerkUserId, email, displayName, profilePhotoUrl]
      );
      return res.json(result.rows[0]);
    }

    // Create new user
    const result = await db.query(
      `INSERT INTO users (clerk_id, email, display_name, profile_photo_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [clerkUserId, email, displayName, profilePhotoUrl]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Sync user error:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
};

// Get YouTube OAuth URL
const getYouTubeAuthUrl = async (req, res) => {
  try {
    const { clerkUserId } = req;
    const authUrl = youtubeService.getAuthUrl(clerkUserId);
    res.json({ authUrl });
  } catch (error) {
    console.error('YouTube auth URL error:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
};

// Handle YouTube OAuth callback
const youtubeCallback = async (req, res) => {
  try {
    const { code, state: clerkUserId } = req.query;

    if (!code || !clerkUserId) {
      return res.redirect(`${process.env.CLIENT_URL}/profile/connect?error=missing_params`);
    }

    // Exchange code for tokens
    const tokens = await youtubeService.getTokensFromCode(code);
    
    // Get channel stats
    const channelData = await youtubeService.getChannelStats(tokens.access_token);

    // Check if user exists
    const userResult = await db.query(
      'SELECT id FROM users WHERE clerk_id = $1',
      [clerkUserId]
    );

    if (!userResult.rows[0]) {
      return res.redirect(`${process.env.CLIENT_URL}/profile/connect?error=user_not_found`);
    }

    const userId = userResult.rows[0].id;

    // Upsert platform data
    await db.query(
      `INSERT INTO platforms (
        user_id, platform_name, platform_user_id, access_token, refresh_token,
        token_expires_at, follower_count, engagement_rate, niche, recent_content, stats
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (user_id, platform_name) DO UPDATE SET
        platform_user_id = $3, access_token = $4, refresh_token = $5,
        token_expires_at = $6, follower_count = $7, engagement_rate = $8,
        niche = $9, recent_content = $10, stats = $11, updated_at = NOW()`,
      [
        userId,
        'youtube',
        channelData.platformUserId,
        tokens.access_token,
        tokens.refresh_token,
        tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        channelData.followerCount,
        channelData.engagementRate,
        channelData.niche,
        JSON.stringify(channelData.recentContent),
        JSON.stringify(channelData.stats),
      ]
    );

    // Update user profile photo if not set
    await db.query(
      `UPDATE users 
       SET profile_photo_url = COALESCE(profile_photo_url, $2), updated_at = NOW()
       WHERE id = $1`,
      [userId, channelData.thumbnailUrl]
    );

    res.redirect(`${process.env.CLIENT_URL}/profile/connect?success=true`);
  } catch (error) {
    console.error('YouTube callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/profile/connect?error=oauth_failed`);
  }
};

// Get current user with platform data
const getCurrentUser = async (req, res) => {
  try {
    const { clerkUserId } = req;

    const userResult = await db.query(
      `SELECT u.*, 
        json_agg(
          json_build_object(
            'id', p.id,
            'platform_name', p.platform_name,
            'follower_count', p.follower_count,
            'engagement_rate', p.engagement_rate,
            'niche', p.niche,
            'recent_content', p.recent_content,
            'stats', p.stats
          )
        ) FILTER (WHERE p.id IS NOT NULL) as platforms
       FROM users u
       LEFT JOIN platforms p ON u.id = p.user_id
       WHERE u.clerk_id = $1
       GROUP BY u.id`,
      [clerkUserId]
    );

    if (!userResult.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(userResult.rows[0]);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

module.exports = {
  syncUser,
  getYouTubeAuthUrl,
  youtubeCallback,
  getCurrentUser,
};

