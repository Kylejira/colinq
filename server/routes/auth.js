const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

// POST /api/auth/sync - Sync Clerk user to database
router.post('/sync', requireAuth, authController.syncUser);

// GET /api/auth/me - Get current user with platform data
router.get('/me', requireAuth, authController.getCurrentUser);

// GET /api/auth/youtube - Get YouTube OAuth URL
router.get('/youtube', requireAuth, authController.getYouTubeAuthUrl);

// GET /api/auth/youtube/callback - YouTube OAuth callback
router.get('/youtube/callback', authController.youtubeCallback);

module.exports = router;

