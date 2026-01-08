const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(requireAuth);
router.use(requireAdmin);

// Dashboard
router.get('/stats', adminController.getDashboardStats);
router.get('/analytics', adminController.getAnalytics);

// Verification Queue
router.get('/verifications', adminController.getVerificationQueue);
router.patch('/verifications/:userId', adminController.updateVerificationStatus);

// User Management
router.get('/users', adminController.getUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.patch('/users/:userId/status', adminController.updateUserStatus);

// Moderation
router.get('/reports', adminController.getReports);
router.patch('/reports/:reportId', adminController.updateReportStatus);

// Activity Log
router.get('/activity', adminController.getActivityLog);

module.exports = router;

