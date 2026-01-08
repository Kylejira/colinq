const pool = require('../config/db');

// Middleware to verify user is an admin
const requireAdmin = async (req, res, next) => {
  try {
    // User should already be authenticated via requireAuth middleware
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user is an admin
    const result = await pool.query(
      'SELECT is_admin FROM users WHERE clerk_id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!result.rows[0].is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get user's database ID for logging
    const userResult = await pool.query(
      'SELECT id FROM users WHERE clerk_id = $1',
      [req.userId]
    );
    req.adminId = userResult.rows[0].id;

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Log admin activity
const logAdminActivity = async (adminId, actionType, targetUserId = null, targetReportId = null, details = null) => {
  try {
    await pool.query(
      `INSERT INTO admin_activity_log (admin_id, action_type, target_user_id, target_report_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [adminId, actionType, targetUserId, targetReportId, details ? JSON.stringify(details) : null]
    );
  } catch (error) {
    console.error('Failed to log admin activity:', error);
  }
};

module.exports = { requireAdmin, logAdminActivity };

