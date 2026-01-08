const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { requireAuth } = require('../middleware/auth');

// GET /api/messages - Get all conversations
router.get('/', requireAuth, messageController.getConversations);

// GET /api/messages/unread - Get unread message count
router.get('/unread', requireAuth, messageController.getUnreadCount);

// GET /api/messages/:matchId - Get messages for a match
router.get('/:matchId', requireAuth, messageController.getMessages);

// POST /api/messages/:matchId - Send a message
router.post('/:matchId', requireAuth, messageController.sendMessage);

// PATCH /api/messages/:matchId/read - Mark messages as read
router.patch('/:matchId/read', requireAuth, messageController.markAsRead);

module.exports = router;

