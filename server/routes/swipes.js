const express = require('express');
const router = express.Router();
const swipeController = require('../controllers/swipeController');
const { requireAuth } = require('../middleware/auth');

// GET /api/swipes/discover - Get profiles to swipe on
router.get('/discover', requireAuth, swipeController.getDiscoverProfiles);

// POST /api/swipes - Record a swipe action
router.post('/', requireAuth, swipeController.createSwipe);

// GET /api/swipes/saved - Get saved profiles
router.get('/saved', requireAuth, swipeController.getSavedProfiles);

module.exports = router;

