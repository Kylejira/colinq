const db = require('../config/db');

// Get discoverable profiles for a user based on filters
const getDiscoverProfiles = async (userId, filters = {}, limit = 10) => {
  const {
    niche,
    minFollowers,
    maxFollowers,
    minEngagement,
    location,
  } = filters;

  // Build dynamic WHERE clauses
  const conditions = [
    'u.id != $1',                           // Exclude self
    'u.is_banned = false',                  // Exclude banned users
    `u.id NOT IN (                          -- Exclude already swiped
      SELECT target_id FROM swipes WHERE user_id = $1
    )`,
  ];
  const params = [userId];
  let paramIndex = 2;

  // Filter by niche
  if (niche) {
    conditions.push(`p.niche = $${paramIndex}`);
    params.push(niche);
    paramIndex++;
  }

  // Filter by follower count
  if (minFollowers) {
    conditions.push(`p.follower_count >= $${paramIndex}`);
    params.push(minFollowers);
    paramIndex++;
  }
  if (maxFollowers) {
    conditions.push(`p.follower_count <= $${paramIndex}`);
    params.push(maxFollowers);
    paramIndex++;
  }

  // Filter by engagement rate
  if (minEngagement) {
    conditions.push(`p.engagement_rate >= $${paramIndex}`);
    params.push(minEngagement);
    paramIndex++;
  }

  // Filter by location
  if (location) {
    conditions.push(`u.location ILIKE $${paramIndex}`);
    params.push(`%${location}%`);
    paramIndex++;
  }

  params.push(limit);

  const query = `
    SELECT 
      u.id,
      u.display_name,
      u.bio,
      u.profile_photo_url,
      u.location,
      u.collaboration_interests,
      u.verification_status,
      u.created_at,
      json_agg(
        json_build_object(
          'platform_name', p.platform_name,
          'follower_count', p.follower_count,
          'engagement_rate', p.engagement_rate,
          'niche', p.niche,
          'recent_content', p.recent_content
        )
      ) FILTER (WHERE p.id IS NOT NULL) as platforms
    FROM users u
    LEFT JOIN platforms p ON u.id = p.user_id
    WHERE ${conditions.join(' AND ')}
    GROUP BY u.id
    ORDER BY 
      CASE WHEN u.verification_status = 'verified' THEN 0 ELSE 1 END,
      RANDOM()
    LIMIT $${paramIndex}
  `;

  const result = await db.query(query, params);
  return result.rows;
};

// Calculate a "why we match" summary between two users
const getMatchReason = async (userId, targetId) => {
  const result = await db.query(`
    SELECT 
      u1.collaboration_interests as user_interests,
      u2.collaboration_interests as target_interests,
      p1.niche as user_niche,
      p1.follower_count as user_followers,
      p2.niche as target_niche,
      p2.follower_count as target_followers
    FROM users u1
    CROSS JOIN users u2
    LEFT JOIN platforms p1 ON u1.id = p1.user_id AND p1.platform_name = 'youtube'
    LEFT JOIN platforms p2 ON u2.id = p2.user_id AND p2.platform_name = 'youtube'
    WHERE u1.id = $1 AND u2.id = $2
  `, [userId, targetId]);

  if (!result.rows[0]) return null;

  const data = result.rows[0];
  const reasons = [];

  // Check for matching niche
  if (data.user_niche && data.target_niche && data.user_niche === data.target_niche) {
    reasons.push(`Both create ${data.target_niche} content`);
  }

  // Check for similar audience size (within 50%)
  if (data.user_followers && data.target_followers) {
    const ratio = Math.min(data.user_followers, data.target_followers) / 
                  Math.max(data.user_followers, data.target_followers);
    if (ratio > 0.5) {
      reasons.push('Similar audience size');
    }
  }

  // Check for overlapping collaboration interests
  if (data.user_interests && data.target_interests) {
    const overlap = data.user_interests.filter(i => data.target_interests.includes(i));
    if (overlap.length > 0) {
      reasons.push(`Both interested in: ${overlap.slice(0, 2).join(', ')}`);
    }
  }

  return reasons.length > 0 ? reasons : ['New potential collaboration partner'];
};

// Check if two users have mutually liked each other
const checkMutualLike = async (userId, targetId) => {
  const result = await db.query(`
    SELECT 1 FROM swipes 
    WHERE user_id = $1 AND target_id = $2 AND action IN ('like', 'superlike')
  `, [targetId, userId]);

  return result.rows.length > 0;
};

// Create a match between two users
const createMatch = async (user1Id, user2Id) => {
  // Ensure consistent ordering (smaller UUID first)
  const [first, second] = user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];

  const result = await db.query(`
    INSERT INTO matches (user1_id, user2_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
    RETURNING *
  `, [first, second]);

  return result.rows[0];
};

module.exports = {
  getDiscoverProfiles,
  getMatchReason,
  checkMutualLike,
  createMatch,
};



