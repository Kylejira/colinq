const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { requireAuth } = require('../middleware/auth');

// GET /api/matches - Get all matches
router.get('/', requireAuth, matchController.getMatches);

// GET /api/matches/:id - Get single match
router.get('/:id', requireAuth, matchController.getMatchById);

// PATCH /api/matches/:id - Update match status
router.patch('/:id', requireAuth, matchController.updateMatchStatus);

module.exports = router;



