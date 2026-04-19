// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAuditLogs } = require('../controllers/auditController');
const { getTenderEligible } = require('../controllers/tenderController');
const {
  getDashboardStats,
  getAllRecords,
  reviewRecord,
  getAllUsers,
  createAnnouncement,
  getAnnouncements,
  toggleAnnouncement,
  deleteAnnouncement,
  createScheduleItem,
  getScheduleItems,
  updateScheduleEventStatus,
  toggleScheduleItem,
  deleteScheduleItem,
  toggleUserActive,
} = require('../controllers/adminController');

router.get('/audit-logs', protect, authorize('admin'), getAuditLogs);
router.get('/tender-eligible', protect, authorize('admin'), getTenderEligible);
router.get('/dashboard', protect, authorize('admin'), getDashboardStats);
router.get('/records', protect, authorize('admin'), getAllRecords);
router.put('/records/:id/review', protect, authorize('admin'), reviewRecord);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.patch('/users/:id/toggle-active', protect, authorize('admin'), toggleUserActive);

// Announcements
router.post('/announcements', protect, authorize('admin'), createAnnouncement);
router.get('/announcements', protect, authorize('admin'), getAnnouncements);
router.patch('/announcements/:id/toggle', protect, authorize('admin'), toggleAnnouncement);
router.delete('/announcements/:id', protect, authorize('admin'), deleteAnnouncement);

// Schedule
router.post('/schedule', protect, authorize('admin'), createScheduleItem);
router.get('/schedule', protect, authorize('admin'), getScheduleItems);
router.patch('/schedule/:id/status', protect, authorize('admin'), updateScheduleEventStatus);
router.patch('/schedule/:id/toggle', protect, authorize('admin'), toggleScheduleItem);
router.delete('/schedule/:id', protect, authorize('admin'), deleteScheduleItem);

module.exports = router;
