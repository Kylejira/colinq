const { clerkClient } = require('@clerk/clerk-sdk-node');

// Middleware to verify Clerk session token
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the session token with Clerk
    const { sub: clerkUserId } = await clerkClient.verifyToken(token);
    
    if (!clerkUserId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.clerkUserId = clerkUserId;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Middleware to optionally attach user if token present
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { sub: clerkUserId } = await clerkClient.verifyToken(token);
      req.clerkUserId = clerkUserId;
    }
    
    next();
  } catch (error) {
    // Continue without auth if token is invalid
    next();
  }
};

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    const db = require('../config/db');
    
    const result = await db.query(
      'SELECT is_admin FROM users WHERE clerk_id = $1',
      [req.clerkUserId]
    );

    if (!result.rows[0] || !result.rows[0].is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  requireAuth,
  optionalAuth,
  requireAdmin,
};

