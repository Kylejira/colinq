const db = require('../config/db');

// Get user profile by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT u.id, u.display_name, u.bio, u.profile_photo_url, u.location,
              u.collaboration_interests, u.verification_status, u.created_at,
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
       WHERE u.id = $1 AND u.is_banned = false
       GROUP BY u.id`,
      [id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { clerkUserId } = req;
    const {
      displayName,
      bio,
      profilePhotoUrl,
      location,
      collaborationInterests,
      audienceDemographics,
      preferences,
    } = req.body;

    const result = await db.query(
      `UPDATE users SET
        display_name = COALESCE($2, display_name),
        bio = COALESCE($3, bio),
        profile_photo_url = COALESCE($4, profile_photo_url),
        location = COALESCE($5, location),
        collaboration_interests = COALESCE($6, collaboration_interests),
        audience_demographics = COALESCE($7, audience_demographics),
        preferences = COALESCE($8, preferences),
        updated_at = NOW()
       WHERE clerk_id = $1
       RETURNING *`,
      [
        clerkUserId,
        displayName,
        bio,
        profilePhotoUrl,
        location,
        collaborationInterests,
        audienceDemographics ? JSON.stringify(audienceDemographics) : null,
        preferences ? JSON.stringify(preferences) : null,
      ]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Upload verification video URL
const uploadVerificationVideo = async (req, res) => {
  try {
    const { clerkUserId } = req;
    const { verificationVideoUrl } = req.body;

    if (!verificationVideoUrl) {
      return res.status(400).json({ error: 'Verification video URL required' });
    }

    const result = await db.query(
      `UPDATE users SET
        verification_video_url = $2,
        verification_status = 'pending',
        updated_at = NOW()
       WHERE clerk_id = $1
       RETURNING *`,
      [clerkUserId, verificationVideoUrl]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Upload verification video error:', error);
    res.status(500).json({ error: 'Failed to upload verification video' });
  }
};

// Check if profile is complete
const checkProfileComplete = async (req, res) => {
  try {
    const { clerkUserId } = req;

    const result = await db.query(
      `SELECT u.*, 
        EXISTS(SELECT 1 FROM platforms WHERE user_id = u.id) as has_platform
       FROM users u
       WHERE u.clerk_id = $1`,
      [clerkUserId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    
    const isComplete = !!(
      user.display_name &&
      user.bio &&
      user.has_platform
    );

    const missingFields = [];
    if (!user.display_name) missingFields.push('displayName');
    if (!user.bio) missingFields.push('bio');
    if (!user.has_platform) missingFields.push('platform');

    res.json({
      isComplete,
      missingFields,
      verificationStatus: user.verification_status,
    });
  } catch (error) {
    console.error('Check profile error:', error);
    res.status(500).json({ error: 'Failed to check profile' });
  }
};

module.exports = {
  getUserById,
  updateProfile,
  uploadVerificationVideo,
  checkProfileComplete,
};

