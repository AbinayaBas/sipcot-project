const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

function escapeRegex(s) {
  return String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/admin/audit-logs — admin only (route enforced)
exports.getAuditLogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 40));
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.action && String(req.query.action).trim()) {
      filter.action = String(req.query.action).trim();
    }
    if (req.query.role && ['admin', 'industry'].includes(req.query.role)) {
      filter.actorRole = req.query.role;
    }
    if (req.query.q && String(req.query.q).trim()) {
      const qStr = String(req.query.q).trim().slice(0, 200);
      try {
        filter.summary = new RegExp(escapeRegex(qStr), 'i');
      } catch {
        return res.status(400).json({ success: false, message: 'Invalid search text' });
      }
    }

    const [total, logs] = await Promise.all([
      AuditLog.countDocuments(filter),
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('actor', 'name email role')
        .populate('industry', 'name sipcotPark')
        .lean(),
    ]);

    res.json({
      success: true,
      data: logs,
      total,
      page,
      pages: Math.ceil(total / limit) || 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/user/activity — industry: own actions + events for their unit; admin: own actions only
exports.getMyActivity = async (req, res) => {
  try {
    const uid = req.user._id || req.user.id;

    let filter;
    if (req.user.role === 'admin') {
      filter = { actor: uid };
    } else {
      const me = await User.findById(req.user.id).select('industry');
      if (!me) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      filter = { $or: [{ actor: uid }] };
      if (me.industry) {
        filter.$or.push({ industry: me.industry });
      }
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(80, Math.max(1, parseInt(req.query.limit, 10) || 30));
    const skip = (page - 1) * limit;

    const [total, logs] = await Promise.all([
      AuditLog.countDocuments(filter),
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('actor', 'name email role')
        .lean(),
    ]);

    res.json({
      success: true,
      data: logs,
      total,
      page,
      pages: Math.ceil(total / limit) || 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
