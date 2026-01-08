const pool = require('../config/db');
const { logAdminActivity } = require('../middleware/adminAuth');

// ==================== DASHBOARD STATS ====================

const getDashboardStats = async (req, res) => {
  try {
    // Get various stats in parallel
    const [
      totalUsersResult,
      activeUsersResult,
      pendingVerificationsResult,
      pendingReportsResult,
      matchesResult,
      subscriptionsResult,
      recentSignupsResult,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query(`SELECT COUNT(*) FROM users WHERE updated_at > NOW() - INTERVAL '7 days'`),
      pool.query(`SELECT COUNT(*) FROM users WHERE verification_status = 'pending' AND verification_video_url IS NOT NULL`),
      pool.query(`SELECT COUNT(*) FROM reports WHERE status = 'pending'`),
      pool.query('SELECT COUNT(*) FROM matches'),
      pool.query(`SELECT tier, COUNT(*) as count FROM subscriptions WHERE status = 'active' GROUP BY tier`),
      pool.query(`SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days'`),
    ]);

    // Calculate subscription breakdown
    const subscriptionBreakdown = {
      free: 0,
      pro: 0,
      premium: 0,
    };
    subscriptionsResult.rows.forEach(row => {
      subscriptionBreakdown[row.tier] = parseInt(row.count);
    });

    res.json({
      totalUsers: parseInt(totalUsersResult.rows[0].count),
      activeUsers: parseInt(activeUsersResult.rows[0].count),
      pendingVerifications: parseInt(pendingVerificationsResult.rows[0].count),
      pendingReports: parseInt(pendingReportsResult.rows[0].count),
      totalMatches: parseInt(matchesResult.rows[0].count),
      recentSignups: parseInt(recentSignupsResult.rows[0].count),
      subscriptionBreakdown,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);

    // User signups over time
    const signupsResult = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at > NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    // Matches over time
    const matchesResult = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM matches
      WHERE created_at > NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    // Messages over time
    const messagesResult = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM messages
      WHERE created_at > NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    // Top niches
    const nichesResult = await pool.query(`
      SELECT niche, COUNT(*) as count
      FROM platforms
      WHERE niche IS NOT NULL
      GROUP BY niche
      ORDER BY count DESC
      LIMIT 10
    `);

    // Verification stats
    const verificationStats = await pool.query(`
      SELECT verification_status, COUNT(*) as count
      FROM users
      GROUP BY verification_status
    `);

    res.json({
      signups: signupsResult.rows,
      matches: matchesResult.rows,
      messages: messagesResult.rows,
      topNiches: nichesResult.rows,
      verificationStats: verificationStats.rows,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// ==================== VERIFICATION QUEUE ====================

const getVerificationQueue = async (req, res) => {
  try {
    const { status = 'pending', limit = 20, offset = 0 } = req.query;

    const result = await pool.query(`
      SELECT 
        u.id, u.clerk_id, u.email, u.display_name, u.profile_photo_url,
        u.verification_video_url, u.verification_status, u.created_at,
        p.platform_name, p.follower_count, p.engagement_rate, p.niche
      FROM users u
      LEFT JOIN platforms p ON u.id = p.user_id AND p.platform_name = 'youtube'
      WHERE u.verification_status = $1 
        AND u.verification_video_url IS NOT NULL
      ORDER BY u.created_at ASC
      LIMIT $2 OFFSET $3
    `, [status, limit, offset]);

    const countResult = await pool.query(`
      SELECT COUNT(*) FROM users 
      WHERE verification_status = $1 AND verification_video_url IS NOT NULL
    `, [status]);

    res.json({
      users: result.rows,
      total: parseInt(countResult.rows[0].count),
    });
  } catch (error) {
    console.error('Error fetching verification queue:', error);
    res.status(500).json({ error: 'Failed to fetch verification queue' });
  }
};

const updateVerificationStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(`
      UPDATE users 
      SET verification_status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, display_name, verification_status
    `, [status, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log admin activity
    await logAdminActivity(
      req.adminId,
      `verification_${status}`,
      userId,
      null,
      { reason }
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating verification status:', error);
    res.status(500).json({ error: 'Failed to update verification status' });
  }
};

// ==================== USER MANAGEMENT ====================

const getUsers = async (req, res) => {
  try {
    const { search, status, tier, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT 
        u.id, u.clerk_id, u.email, u.display_name, u.profile_photo_url,
        u.verification_status, u.subscription_tier, u.is_banned, u.is_admin,
        u.created_at, u.updated_at,
        p.platform_name, p.follower_count, p.engagement_rate, p.niche
      FROM users u
      LEFT JOIN platforms p ON u.id = p.user_id AND p.platform_name = 'youtube'
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (u.display_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      query += ` AND u.verification_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (tier) {
      query += ` AND u.subscription_tier = $${paramIndex}`;
      params.push(tier);
      paramIndex++;
    }

    query += ` ORDER BY u.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM users u WHERE 1=1';
    const countParams = [];
    let countParamIndex = 1;

    if (search) {
      countQuery += ` AND (u.display_name ILIKE $${countParamIndex} OR u.email ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    if (status) {
      countQuery += ` AND u.verification_status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }

    if (tier) {
      countQuery += ` AND u.subscription_tier = $${countParamIndex}`;
      countParams.push(tier);
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      users: result.rows,
      total: parseInt(countResult.rows[0].count),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const userResult = await pool.query(`
      SELECT 
        u.*,
        (SELECT COUNT(*) FROM matches WHERE user1_id = u.id OR user2_id = u.id) as match_count,
        (SELECT COUNT(*) FROM messages WHERE sender_id = u.id) as message_count,
        (SELECT COUNT(*) FROM collaborations c 
         JOIN matches m ON c.match_id = m.id 
         WHERE m.user1_id = u.id OR m.user2_id = u.id) as collab_count,
        (SELECT COUNT(*) FROM reports WHERE reported_user_id = u.id) as report_count
      FROM users u
      WHERE u.id = $1
    `, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const platformsResult = await pool.query(
      'SELECT * FROM platforms WHERE user_id = $1',
      [userId]
    );

    const reportsResult = await pool.query(`
      SELECT r.*, u.display_name as reporter_name
      FROM reports r
      JOIN users u ON r.reporter_id = u.id
      WHERE r.reported_user_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [userId]);

    res.json({
      user: userResult.rows[0],
      platforms: platformsResult.rows,
      reports: reportsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, reason } = req.body;

    let updateField;
    let updateValue;

    switch (action) {
      case 'ban':
        updateField = 'is_banned';
        updateValue = true;
        break;
      case 'unban':
        updateField = 'is_banned';
        updateValue = false;
        break;
      case 'make_admin':
        updateField = 'is_admin';
        updateValue = true;
        break;
      case 'remove_admin':
        updateField = 'is_admin';
        updateValue = false;
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    const result = await pool.query(`
      UPDATE users 
      SET ${updateField} = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, display_name, is_banned, is_admin
    `, [updateValue, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log admin activity
    await logAdminActivity(
      req.adminId,
      `user_${action}`,
      userId,
      null,
      { reason }
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

// ==================== MODERATION ====================

const getReports = async (req, res) => {
  try {
    const { status = 'pending', type, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT 
        r.*,
        reporter.display_name as reporter_name,
        reporter.email as reporter_email,
        reported.display_name as reported_user_name,
        reported.email as reported_user_email,
        reported.profile_photo_url as reported_user_photo,
        m.content as message_content
      FROM reports r
      JOIN users reporter ON r.reporter_id = reporter.id
      LEFT JOIN users reported ON r.reported_user_id = reported.id
      LEFT JOIN messages m ON r.reported_message_id = m.id
      WHERE r.status = $1
    `;
    const params = [status];
    let paramIndex = 2;

    if (type) {
      query += ` AND r.report_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    query += ` ORDER BY r.created_at ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get counts by status
    const countsResult = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM reports
      GROUP BY status
    `);

    const counts = { pending: 0, reviewing: 0, resolved: 0, dismissed: 0 };
    countsResult.rows.forEach(row => {
      counts[row.status] = parseInt(row.count);
    });

    res.json({
      reports: result.rows,
      counts,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, resolutionNotes, banUser } = req.body;

    if (!['reviewing', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update report
      const reportResult = await client.query(`
        UPDATE reports 
        SET 
          status = $1, 
          resolution_notes = $2,
          resolved_by = $3,
          resolved_at = CASE WHEN $1 IN ('resolved', 'dismissed') THEN CURRENT_TIMESTAMP ELSE resolved_at END
        WHERE id = $4
        RETURNING *
      `, [status, resolutionNotes, req.adminId, reportId]);

      if (reportResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Report not found' });
      }

      const report = reportResult.rows[0];

      // Ban user if requested
      if (banUser && report.reported_user_id) {
        await client.query(`
          UPDATE users SET is_banned = true, updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [report.reported_user_id]);

        await logAdminActivity(
          req.adminId,
          'user_ban',
          report.reported_user_id,
          reportId,
          { reason: 'Report resolution' }
        );
      }

      await client.query('COMMIT');

      // Log admin activity
      await logAdminActivity(
        req.adminId,
        `report_${status}`,
        report.reported_user_id,
        reportId,
        { resolutionNotes }
      );

      res.json(report);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ error: 'Failed to update report status' });
  }
};

// ==================== ACTIVITY LOG ====================

const getActivityLog = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await pool.query(`
      SELECT 
        al.*,
        admin.display_name as admin_name,
        target.display_name as target_user_name
      FROM admin_activity_log al
      JOIN users admin ON al.admin_id = admin.id
      LEFT JOIN users target ON al.target_user_id = target.id
      ORDER BY al.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching activity log:', error);
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
};

module.exports = {
  getDashboardStats,
  getAnalytics,
  getVerificationQueue,
  updateVerificationStatus,
  getUsers,
  getUserDetails,
  updateUserStatus,
  getReports,
  updateReportStatus,
  getActivityLog,
};



