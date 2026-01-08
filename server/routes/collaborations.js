const express = require('express');
const router = express.Router();
const collaborationController = require('../controllers/collaborationController');
const { requireAuth } = require('../middleware/auth');

// GET /api/collaborations/templates - Get contract templates
router.get('/templates', requireAuth, collaborationController.getContractTemplates);

// GET /api/collaborations/templates/:templateId - Get single template
router.get('/templates/:templateId', requireAuth, collaborationController.getContractTemplate);

// GET /api/collaborations - Get all collaborations
router.get('/', requireAuth, collaborationController.getCollaborations);

// POST /api/collaborations - Create collaboration
router.post('/', requireAuth, collaborationController.createCollaboration);

// GET /api/collaborations/:id - Get single collaboration
router.get('/:id', requireAuth, collaborationController.getCollaboration);

// POST /api/collaborations/:id/contract - Create/update contract
router.post('/:id/contract', requireAuth, collaborationController.createContract);

// POST /api/collaborations/:id/sign - Sign contract
router.post('/:id/sign', requireAuth, collaborationController.signContract);

// PATCH /api/collaborations/:id/checklist - Update checklist
router.patch('/:id/checklist', requireAuth, collaborationController.updateChecklist);

// PATCH /api/collaborations/:id/status - Update status
router.patch('/:id/status', requireAuth, collaborationController.updateStatus);

module.exports = router;

