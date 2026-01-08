const db = require('../config/db');

// Get all conversations for current user
const getConversations = async (req, res) => {
  try {
    const { clerkUserId } = req;

    const result = await db.query(`
      SELECT 
        m.id as match_id,
        m.created_at as matched_at,
        CASE 
          WHEN m.user1_id = me.id THEN m.user2_id 
          ELSE m.user1_id 
        END as other_user_id,
        u.display_name,
        u.profile_photo_url,
        u.verification_status,
        (
          SELECT json_build_object(
            'id', msg.id,
            'content', msg.content,
            'sender_id', msg.sender_id,
            'created_at', msg.created_at,
            'is_read', msg.is_read
          )
          FROM messages msg
          WHERE msg.match_id = m.id
          ORDER BY msg.created_at DESC
          LIMIT 1
        ) as last_message,
        (
          SELECT COUNT(*)::int
          FROM messages msg
          WHERE msg.match_id = m.id 
            AND msg.sender_id != me.id 
            AND msg.is_read = false
        ) as unread_count
      FROM matches m
      JOIN users me ON me.clerk_id = $1
      JOIN users u ON u.id = CASE 
        WHEN m.user1_id = me.id THEN m.user2_id 
        ELSE m.user1_id 
      END
      WHERE (m.user1_id = me.id OR m.user2_id = me.id)
        AND m.status = 'active'
      ORDER BY 
        COALESCE(
          (SELECT created_at FROM messages WHERE match_id = m.id ORDER BY created_at DESC LIMIT 1),
          m.created_at
        ) DESC
    `, [clerkUserId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
};

// Get messages for a specific match
const getMessages = async (req, res) => {
  try {
    const { clerkUserId } = req;
    const { matchId } = req.params;
    const { limit = 50, before } = req.query;

    // Verify user is part of this match
    const matchResult = await db.query(`
      SELECT m.*, me.id as my_id
      FROM matches m
      JOIN users me ON me.clerk_id = $1
      WHERE m.id = $2 AND (m.user1_id = me.id OR m.user2_id = me.id)
    `, [clerkUserId, matchId]);

    if (!matchResult.rows[0]) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const myId = matchResult.rows[0].my_id;

    // Build query with pagination
    let query = `
      SELECT 
        msg.id,
        msg.content,
        msg.sender_id,
        msg.is_read,
        msg.created_at,
        msg.sender_id = $2 as is_mine
      FROM messages msg
      WHERE msg.match_id = $1
    `;
    const params = [matchId, myId];

    if (before) {
      query += ` AND msg.created_at < $3`;
      params.push(before);
    }

    query += ` ORDER BY msg.created_at DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));

    const result = await db.query(query, params);

    // Return in chronological order
    res.json(result.rows.reverse());
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { clerkUserId } = req;
    const { matchId } = req.params;
    const { content, collabType } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Get user and verify they're part of this match
    const userResult = await db.query(`
      SELECT u.id, u.subscription_tier, m.id as match_id
      FROM users u
      JOIN matches m ON (m.user1_id = u.id OR m.user2_id = u.id)
      WHERE u.clerk_id = $1 AND m.id = $2
    `, [clerkUserId, matchId]);

    if (!userResult.rows[0]) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const user = userResult.rows[0];

    // Check message limit for free tier
    if (user.subscription_tier === 'free') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const usageResult = await db.query(`
        SELECT COUNT(*)::int as message_count
        FROM messages
        WHERE sender_id = $1 AND created_at >= $2
      `, [user.id, startOfMonth.toISOString()]);

      if (usageResult.rows[0].message_count >= 3) {
        return res.status(403).json({
          error: 'Monthly message limit reached',
          message: 'Free users can send 3 messages per month. Upgrade to Pro for unlimited messaging.',
          upgradeRequired: true
        });
      }
    }

    // Build message content (include collab type if provided)
    let messageContent = content.trim();
    if (collabType) {
      messageContent = `[Collaboration Proposal: ${collabType}]\n\n${messageContent}`;
    }

    // Insert message
    const result = await db.query(`
      INSERT INTO messages (match_id, sender_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [matchId, user.id, messageContent]);

    const message = result.rows[0];
    message.is_mine = true;

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { clerkUserId } = req;
    const { matchId } = req.params;

    // Get user ID and verify they're part of this match
    const userResult = await db.query(`
      SELECT u.id
      FROM users u
      JOIN matches m ON (m.user1_id = u.id OR m.user2_id = u.id)
      WHERE u.clerk_id = $1 AND m.id = $2
    `, [clerkUserId, matchId]);

    if (!userResult.rows[0]) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const userId = userResult.rows[0].id;

    // Mark all messages from the other user as read
    await db.query(`
      UPDATE messages 
      SET is_read = true
      WHERE match_id = $1 AND sender_id != $2 AND is_read = false
    `, [matchId, userId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const { clerkUserId } = req;

    const result = await db.query(`
      SELECT COUNT(*)::int as unread_count
      FROM messages msg
      JOIN matches m ON msg.match_id = m.id
      JOIN users me ON me.clerk_id = $1
      WHERE (m.user1_id = me.id OR m.user2_id = me.id)
        AND msg.sender_id != me.id
        AND msg.is_read = false
    `, [clerkUserId]);

    res.json({ unreadCount: result.rows[0].unread_count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
};

