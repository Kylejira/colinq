const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

// GET /api/users/:id - Get user profile by ID
router.get('/:id', userController.getUserById);

// PUT /api/users/profile - Update current user's profile
router.put('/profile', requireAuth, userController.updateProfile);

// POST /api/users/verification-video - Upload verification video
router.post('/verification-video', requireAuth, userController.uploadVerificationVideo);

// GET /api/users/profile/status - Check if profile is complete
router.get('/profile/status', requireAuth, userController.checkProfileComplete);

module.exports = router;

