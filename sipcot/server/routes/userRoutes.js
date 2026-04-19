// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const { getMyActivity } = require('../controllers/auditController');

router.get('/activity', protect, getMyActivity);

// Get user notifications
router.get('/notifications', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notifications');
    res.json({ success: true, data: user.notifications?.slice().reverse() || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mark all notifications as read
router.put('/notifications/read', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $set: { 'notifications.$[].read': true } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
