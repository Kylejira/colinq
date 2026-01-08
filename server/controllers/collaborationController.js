const db = require('../config/db');
const contractService = require('../services/contractService');

// Create a new collaboration from a match
const createCollaboration = async (req, res) => {
  try {
    const { clerkUserId } = req;
    const { matchId, title, description, collaborationType } = req.body;

    if (!matchId || !title) {
      return res.status(400).json({ error: 'matchId and title are required' });
    }

    // Verify user is part of this match
    const matchResult = await db.query(`
      SELECT m.* FROM matches m
      JOIN users u ON u.clerk_id = $1
      WHERE m.id = $2 AND (m.user1_id = u.id OR m.user2_id = u.id)
    `, [clerkUserId, matchId]);

    if (!matchResult.rows[0]) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Create collaboration
    const result = await db.query(`
      INSERT INTO collaborations (match_id, title, description, collaboration_type, checklist)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [matchId, title, description, collaborationType, JSON.stringify([])]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create collaboration error:', error);
    res.status(500).json({ error: 'Failed to create collaboration' });
  }
};

// Get collaboration by ID
const getCollaboration = async (req, res) => {
  try {
    const { clerkUserId } = req;
    const { id } = req.params;

    const result = await db.query(`
      SELECT 
        c.*,
        json_build_object(
          'id', con.id,
          'template_id', con.template_id,
          'fields', con.fields,
          'status', con.status,
          'pdf_url', con.pdf_url
        ) as contract,
        (
          SELECT json_agg(json_build_object(
            'user_id', cs.user_id,
            'signed_at', cs.signed_at
          ))
          FROM contract_signatures cs
          WHERE cs.contract_id = con.id
        ) as signatures
      FROM collaborations c
      JOIN matches m ON c.match_id = m.id
      JOIN users me ON me.clerk_id = $1
      LEFT JOIN contracts con ON con.collaboration_id = c.id
      WHERE c.id = $2 AND (m.user1_id = me.id OR m.user2_id = me.id)
    `, [clerkUserId, id]);

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Collaboration not found' });
    }

    // Get both users in the collaboration
    const usersResult = await db.query(`
      SELECT u.id, u.display_name, u.profile_photo_url, u.verification_status
      FROM users u
      JOIN matches m ON m.id = $1
      WHERE u.id = m.user1_id OR u.id = m.user2_id
    `, [result.rows[0].match_id]);

    const collaboration = result.rows[0];
    collaboration.users = usersResult.rows;

    res.json(collaboration);
  } catch (error) {
    console.error('Get collaboration error:', error);
    res.status(500).json({ error: 'Failed to get collaboration' });
  }
};

// Get all collaborations for current user
const getCollaborations = async (req, res) => {
  try {
    const { clerkUserId } = req;

    const result = await db.query(`
      SELECT 
        c.*,
        CASE 
          WHEN m.user1_id = me.id THEN u2.display_name 
          ELSE u1.display_name 
        END as partner_name,
        CASE 
          WHEN m.user1_id = me.id THEN u2.profile_photo_url 
          ELSE u1.profile_photo_url 
        END as partner_photo,
        con.status as contract_status
      FROM collaborations c
      JOIN matches m ON c.match_id = m.id
      JOIN users me ON me.clerk_id = $1
      JOIN users u1 ON u1.id = m.user1_id
      JOIN users u2 ON u2.id = m.user2_id
      LEFT JOIN contracts con ON con.collaboration_id = c.id
      WHERE m.user1_id = me.id OR m.user2_id = me.id
      ORDER BY c.created_at DESC
    `, [clerkUserId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get collaborations error:', error);
    res.status(500).json({ error: 'Failed to get collaborations' });
  }
};

// Get contract templates
const getContractTemplates = async (req, res) => {
  try {
    const templates = contractService.getTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
};

// Get single template with fields
const getContractTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = contractService.getTemplate(templateId);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Failed to get template' });
  }
};

// Create/update contract for collaboration
const createContract = async (req, res) => {
  try {
    const { clerkUserId } = req;
    const { id: collaborationId } = req.params;
    const { templateId, fields } = req.body;

    if (!templateId || !fields) {
      return res.status(400).json({ error: 'templateId and fields are required' });
    }

    // Verify user is part of this collaboration
    const collabResult = await db.query(`
      SELECT c.*, m.user1_id, m.user2_id
      FROM collaborations c
      JOIN matches m ON c.match_id = m.id
      JOIN users me ON me.clerk_id = $1
      WHERE c.id = $2 AND (m.user1_id = me.id OR m.user2_id = me.id)
    `, [clerkUserId, collaborationId]);

    if (!collabResult.rows[0]) {
      return res.status(404).json({ error: 'Collaboration not found' });
    }

    // Upsert contract
    const result = await db.query(`
      INSERT INTO contracts (collaboration_id, template_id, fields, status)
      VALUES ($1, $2, $3, 'draft')
      ON CONFLICT (collaboration_id) DO UPDATE SET
        template_id = $2,
        fields = $3,
        status = 'draft',
        updated_at = NOW()
      RETURNING *
    `, [collaborationId, templateId, JSON.stringify(fields)]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create contract error:', error);
    res.status(500).json({ error: 'Failed to create contract' });
  }
};

// Sign contract
const signContract = async (req, res) => {
  try {
    const { clerkUserId } = req;
    const { id: collaborationId } = req.params;
    const { signatureData } = req.body;

    if (!signatureData) {
      return res.status(400).json({ error: 'signatureData is required' });
    }

    // Get user and verify they're part of this collaboration
    const userResult = await db.query(`
      SELECT u.id, u.display_name, c.id as collab_id, con.id as contract_id, con.status,
             m.user1_id, m.user2_id
      FROM users u
      JOIN matches m ON (m.user1_id = u.id OR m.user2_id = u.id)
      JOIN collaborations c ON c.match_id = m.id
      JOIN contracts con ON con.collaboration_id = c.id
      WHERE u.clerk_id = $1 AND c.id = $2
    `, [clerkUserId, collaborationId]);

    if (!userResult.rows[0]) {
      return res.status(404).json({ error: 'Collaboration or contract not found' });
    }

    const { id: userId, contract_id: contractId, user1_id, user2_id } = userResult.rows[0];

    // Add signature
    await db.query(`
      INSERT INTO contract_signatures (contract_id, user_id, signature_data, signed_at, ip_address)
      VALUES ($1, $2, $3, NOW(), $4)
      ON CONFLICT (contract_id, user_id) DO UPDATE SET
        signature_data = $3,
        signed_at = NOW(),
        ip_address = $4
    `, [contractId, userId, signatureData, req.ip]);

    // Check if both parties have signed
    const signaturesResult = await db.query(`
      SELECT user_id FROM contract_signatures WHERE contract_id = $1
    `, [contractId]);

    const signedUserIds = signaturesResult.rows.map(r => r.user_id);
    const bothSigned = signedUserIds.includes(user1_id) && signedUserIds.includes(user2_id);

    if (bothSigned) {
      // Update contract status to signed
      await db.query(`
        UPDATE contracts SET status = 'signed', updated_at = NOW() WHERE id = $1
      `, [contractId]);

      // Generate final PDF
      const contractResult = await db.query(`
        SELECT con.*, 
          json_agg(json_build_object('user_id', cs.user_id, 'signed_at', cs.signed_at)) as signatures
        FROM contracts con
        LEFT JOIN contract_signatures cs ON cs.contract_id = con.id
        WHERE con.id = $1
        GROUP BY con.id
      `, [contractId]);

      const contract = contractResult.rows[0];

      // Get users for PDF
      const usersResult = await db.query(`
        SELECT id, display_name FROM users WHERE id IN ($1, $2)
      `, [user1_id, user2_id]);

      try {
        const pdfBuffer = await contractService.generateContractPdf(
          contract,
          { id: collaborationId },
          usersResult.rows
        );

        const pdfUrl = await contractService.uploadContractPdf(contractId, pdfBuffer);

        await db.query(`
          UPDATE contracts SET pdf_url = $2, updated_at = NOW() WHERE id = $1
        `, [contractId, pdfUrl]);
      } catch (pdfError) {
        console.error('PDF generation error:', pdfError);
        // Continue even if PDF fails
      }
    } else {
      // Update status to pending_signatures
      await db.query(`
        UPDATE contracts SET status = 'pending_signatures', updated_at = NOW() WHERE id = $1
      `, [contractId]);
    }

    res.json({ 
      success: true, 
      bothSigned,
      message: bothSigned ? 'Contract fully signed!' : 'Signature recorded. Waiting for other party.'
    });
  } catch (error) {
    console.error('Sign contract error:', error);
    res.status(500).json({ error: 'Failed to sign contract' });
  }
};

// Update collaboration checklist
const updateChecklist = async (req, res) => {
  try {
    const { clerkUserId } = req;
    const { id: collaborationId } = req.params;
    const { checklist } = req.body;

    if (!Array.isArray(checklist)) {
      return res.status(400).json({ error: 'checklist must be an array' });
    }

    // Verify user is part of this collaboration
    const verifyResult = await db.query(`
      SELECT c.id FROM collaborations c
      JOIN matches m ON c.match_id = m.id
      JOIN users me ON me.clerk_id = $1
      WHERE c.id = $2 AND (m.user1_id = me.id OR m.user2_id = me.id)
    `, [clerkUserId, collaborationId]);

    if (!verifyResult.rows[0]) {
      return res.status(404).json({ error: 'Collaboration not found' });
    }

    const result = await db.query(`
      UPDATE collaborations 
      SET checklist = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [collaborationId, JSON.stringify(checklist)]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update checklist error:', error);
    res.status(500).json({ error: 'Failed to update checklist' });
  }
};

// Update collaboration status
const updateStatus = async (req, res) => {
  try {
    const { clerkUserId } = req;
    const { id: collaborationId } = req.params;
    const { status } = req.body;

    if (!['proposed', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Verify user is part of this collaboration
    const verifyResult = await db.query(`
      SELECT c.id FROM collaborations c
      JOIN matches m ON c.match_id = m.id
      JOIN users me ON me.clerk_id = $1
      WHERE c.id = $2 AND (m.user1_id = me.id OR m.user2_id = me.id)
    `, [clerkUserId, collaborationId]);

    if (!verifyResult.rows[0]) {
      return res.status(404).json({ error: 'Collaboration not found' });
    }

    const result = await db.query(`
      UPDATE collaborations 
      SET status = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [collaborationId, status]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

module.exports = {
  createCollaboration,
  getCollaboration,
  getCollaborations,
  getContractTemplates,
  getContractTemplate,
  createContract,
  signContract,
  updateChecklist,
  updateStatus,
};

