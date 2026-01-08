const db = require('../config/db');

// Get all matches for current user
const getMatches = async (req, res) => {
  try {
    const { clerkUserId } = req;

    const result = await db.query(`
      SELECT 
        m.id,
        m.status,
        m.created_at,
        CASE 
          WHEN m.user1_id = me.id THEN m.user2_id 
          ELSE m.user1_id 
        END as matched_user_id,
        u.display_name,
        u.profile_photo_url,
        u.verification_status,
        json_agg(
          json_build_object(
            'platform_name', p.platform_name,
            'follower_count', p.follower_count,
            'niche', p.niche
          )
        ) FILTER (WHERE p.id IS NOT NULL) as platforms,
        (
          SELECT json_build_object(
            'id', msg.id,
            'content', msg.content,
            'sender_id', msg.sender_id,
            'created_at', msg.created_at
          )
          FROM messages msg
          WHERE msg.match_id = m.id
          ORDER BY msg.created_at DESC
          LIMIT 1
        ) as last_message
      FROM matches m
      JOIN users me ON me.clerk_id = $1
      JOIN users u ON u.id = CASE 
        WHEN m.user1_id = me.id THEN m.user2_id 
        ELSE m.user1_id 
      END
      LEFT JOIN platforms p ON u.id = p.user_id
      WHERE (m.user1_id = me.id OR m.user2_id = me.id)
        AND m.status = 'active'
      GROUP BY m.id, me.id, u.id
      ORDER BY m.created_at DESC
    `, [clerkUserId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
};

// Get single match detail
const getMatchById = async (req, res) => {
  try {
    const { clerkUserId } = req;
    const { id } = req.params;

    const result = await db.query(`
      SELECT 
        m.id,
        m.status,
        m.created_at,
        CASE 
          WHEN m.user1_id = me.id THEN m.user2_id 
          ELSE m.user1_id 
        END as matched_user_id,
        u.id as user_id,
        u.display_name,
        u.bio,
        u.profile_photo_url,
        u.location,
        u.collaboration_interests,
        u.verification_status,
        json_agg(
          json_build_object(
            'platform_name', p.platform_name,
            'follower_count', p.follower_count,
            'engagement_rate', p.engagement_rate,
            'niche', p.niche,
            'recent_content', p.recent_content
          )
        ) FILTER (WHERE p.id IS NOT NULL) as platforms
      FROM matches m
      JOIN users me ON me.clerk_id = $1
      JOIN users u ON u.id = CASE 
        WHEN m.user1_id = me.id THEN m.user2_id 
        ELSE m.user1_id 
      END
      LEFT JOIN platforms p ON u.id = p.user_id
      WHERE m.id = $2
        AND (m.user1_id = me.id OR m.user2_id = me.id)
      GROUP BY m.id, me.id, u.id
    `, [clerkUserId, id]);

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get match error:', error);
    res.status(500).json({ error: 'Failed to get match' });
  }
};

// Update match status (archive, block)
const updateMatchStatus = async (req, res) => {
  try {
    const { clerkUserId } = req;
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'archived', 'blocked'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Verify user is part of this match
    const verifyResult = await db.query(`
      SELECT m.id FROM matches m
      JOIN users me ON me.clerk_id = $1
      WHERE m.id = $2 AND (m.user1_id = me.id OR m.user2_id = me.id)
    `, [clerkUserId, id]);

    if (!verifyResult.rows[0]) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const result = await db.query(`
      UPDATE matches SET status = $2 WHERE id = $1 RETURNING *
    `, [id, status]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update match error:', error);
    res.status(500).json({ error: 'Failed to update match' });
  }
};

module.exports = {
  getMatches,
  getMatchById,
  updateMatchStatus,
};

