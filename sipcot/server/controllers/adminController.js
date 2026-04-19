// controllers/adminController.js
const DataRecord = require('../models/DataRecord');
const Industry = require('../models/Industry');
const User = require('../models/User');
const { logAudit } = require('../utils/auditLog');
const Announcement = require('../models/Announcement');
const ScheduleItem = require('../models/ScheduleItem');

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// @desc  Admin Dashboard Stats
// @route GET /api/admin/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();

    const [totalIndustries, totalUsers, totalRecords, pendingRecords, approvedRecords, submittedOnly] = await Promise.all([
      Industry.countDocuments(),
      User.countDocuments({ role: 'industry' }),
      DataRecord.countDocuments(),
      DataRecord.countDocuments({ status: { $in: ['Submitted', 'Under Review'] } }),
      DataRecord.countDocuments({ status: 'Approved' }),
      DataRecord.countDocuments({ status: 'Submitted' }),
    ]);

    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const inspectionsToday = await ScheduleItem.countDocuments({
      isActive: true,
      eventStatus: { $ne: 'cancelled' },
      date: { $gte: dayStart, $lt: dayEnd },
    });

    // Decision-support signals (rule-based)
    const overdueDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [underReviewCount, overduePendingCount, pendingByPark, topFlagged] = await Promise.all([
      DataRecord.countDocuments({ status: 'Under Review' }),
      DataRecord.countDocuments({ status: 'Submitted', createdAt: { $lt: overdueDate } }),
      DataRecord.aggregate([
        { $match: { status: 'Submitted' } },
        {
          $lookup: {
            from: 'industries',
            localField: 'industry',
            foreignField: '_id',
            as: 'industryDoc',
          },
        },
        { $unwind: '$industryDoc' },
        { $group: { _id: '$industryDoc.sipcotPark', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      DataRecord.aggregate([
        { $match: { status: { $in: ['Submitted', 'Under Review'] } } },
        {
          $lookup: {
            from: 'industries',
            localField: 'industry',
            foreignField: '_id',
            as: 'industryDoc',
          },
        },
        { $unwind: '$industryDoc' },
        {
          $addFields: {
            riskScore: {
              $add: [
                { $cond: [{ $gt: ['$waterUsage.value', 100] }, 20, 0] },
                { $cond: [{ $gt: ['$powerUsage.value', 20000] }, 20, 0] },
                { $cond: [{ $gt: ['$investment.value', 0] }, 0, 10] },
                { $cond: [{ $gt: ['$turnover.value', 0] }, 0, 10] },
                { $cond: ['$effluentTreatment', 0, 15] },
                { $cond: ['$rainwaterHarvesting', 0, 5] },
                { $cond: [{ $gt: ['$csrTotal', 0] }, 0, 10] },
                { $cond: [{ $eq: ['$status', 'Submitted'] }, 10, 0] },
              ],
            },
          },
        },
        { $sort: { riskScore: -1, createdAt: -1 } },
        { $limit: 5 },
        {
          $project: {
            _id: 1,
            year: 1,
            quarter: 1,
            status: 1,
            createdAt: 1,
            riskScore: 1,
            industry: { _id: '$industryDoc._id', name: '$industryDoc.name', sipcotPark: '$industryDoc.sipcotPark', type: '$industryDoc.type' },
          },
        },
      ]),
    ]);

    // Aggregate totals from approved records
    const aggregates = await DataRecord.aggregate([
      { $match: { status: 'Approved' } },
      { $group: {
        _id: null,
        totalEmployment: { $sum: '$employment.total' },
        totalInvestment: { $sum: '$investment.value' },
        totalTurnover: { $sum: '$turnover.value' },
        totalWater: { $sum: '$waterUsage.value' },
        totalPower: { $sum: '$powerUsage.value' }
      }}
    ]);

    // Monthly submissions for chart
    const monthlyData = await DataRecord.aggregate([
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // Industry type distribution
    const industryByType = await Industry.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Year-wise investment trend
    const yearlyTrend = await DataRecord.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: '$year', investment: { $sum: '$investment.value' }, employment: { $sum: '$employment.total' }, turnover: { $sum: '$turnover.value' } } },
      { $sort: { _id: 1 } },
      { $limit: 5 }
    ]);

    const recentRecords = await DataRecord.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('industry', 'name')
      .select('year quarter status industry updatedAt')
      .lean();

    const recentActivity = recentRecords.map((r) => {
      const name = r.industry?.name || 'Industry';
      const yq = `${r.year} ${r.quarter}`;
      let message;
      switch (r.status) {
        case 'Submitted':
          message = `${name} submitted ${yq} report`;
          break;
        case 'Under Review':
          message = `${name} — ${yq} moved to review`;
          break;
        case 'Approved':
          message = `${name} — ${yq} approved`;
          break;
        case 'Rejected':
          message = `${name} — ${yq} returned for correction`;
          break;
        case 'Draft':
          message = `${name} updated ${yq} draft`;
          break;
        default:
          message = `${name} — ${yq} (${r.status})`;
      }
      return {
        id: String(r._id),
        message,
        at: r.updatedAt,
      };
    });

    const alerts = [];
    if (pendingRecords > 0) {
      alerts.push({
        id: 'pending-submitted',
        severity: 'warning',
        title: 'Submissions Waiting for Review',
        message:
          'Some industry submissions are currently pending administrative verification (submitted or under review). Timely review is required to ensure data accuracy and compliance with reporting standards.',
        action: { label: 'View Details', href: '/admin/records' },
      });
    }
    if (overduePendingCount > 0) {
      alerts.push({
        id: 'overdue-pending',
        severity: 'danger',
        title: 'Submissions Pending Beyond SLA Window',
        message: `${overduePendingCount} submitted record(s) have exceeded the recommended review window (7 days). Immediate attention is advised.`,
        action: { label: 'View Details', href: '/admin/records?status=Submitted' },
      });
    }
    if (pendingByPark?.length) {
      const top = pendingByPark[0];
      if (top?._id) {
        alerts.push({
          id: 'park-bottleneck',
          severity: 'warning',
          title: 'Park-wise Bottleneck Detected',
          message:
            'An increased number of pending submissions has been identified in specific industrial parks. Targeted review actions are recommended to reduce processing delays.',
          action: { label: 'View Details', href: '/admin/records?status=Submitted' },
          meta: { pendingByPark },
        });
      }
    }

    if (topFlagged?.length) {
      alerts.push({
        id: 'top-flagged',
        severity: 'danger',
        title: 'High-Risk Submissions Detected',
        message:
          'Certain submissions have been flagged based on predefined risk indicators such as abnormal resource usage patterns or incomplete compliance data. Immediate review is advised.',
        action: { label: 'View Details', href: '/admin/records' },
      });
    }

    const recommendations = [];
    if (overduePendingCount > 0) {
      recommendations.push({
        id: 'rec-review-sla',
        title: 'Prioritize Overdue Submissions',
        rationale:
          'Addressing submissions beyond the SLA window restores reporting accuracy and reduces estate-wide backlog visibility.',
        action: { label: 'View Details', href: '/admin/records?status=Submitted' },
      });
    }
    if ((pendingByPark?.length || 0) > 0) {
      recommendations.push({
        id: 'rec-focus-park',
        title: 'Focus Review Efforts by Park',
        rationale:
          'Review activities should be prioritized based on park-wise submission trends to improve operational efficiency and minimize backlog.',
        action: { label: 'View Details', href: '/admin/industries' },
      });
    }
    if (!recommendations.length) {
      recommendations.push({
        id: 'rec-maintain',
        title: 'Monitoring cadence — system within normal parameters',
        rationale:
          'No critical backlogs detected. Continue periodic verification and use consolidated exports for governance reporting.',
        action: { label: 'View Details', href: '/admin/export' },
      });
    }

    res.json({
      success: true,
      stats: {
        totalIndustries,
        totalUsers,
        totalRecords,
        pendingRecords,
        approvedRecords,
        submittedOnly,
        inspectionsToday,
      },
      aggregates: aggregates[0] || {},
      monthlyData,
      industryByType,
      yearlyTrend,
      recentActivity,
      decisionSupport: {
        generatedAt: now.toISOString(),
        alerts,
        recommendations,
        signals: {
          pendingSubmitted: pendingRecords,
          underReview: underReviewCount,
          overduePending: overduePendingCount,
          pendingByPark,
          topFlagged,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get all data records (admin)
// @route GET /api/admin/records
exports.getAllRecords = async (req, res) => {
  try {
    const {
      status,
      year,
      industry,
      park,
      q,
      page = 1,
      limit: limitQ = 20,
      sortBy = 'recent',
    } = req.query;
    const limit = Math.min(100, Math.max(1, parseInt(limitQ, 10) || 20));
    const pageNum = Math.max(1, parseInt(page, 10) || 1);

    const query = {};
    if (status) query.status = status;
    if (year) query.year = parseInt(year, 10);
    if (industry) {
      query.industry = industry;
    } else if (park || (q && String(q).trim())) {
      const parts = [];
      if (park) parts.push({ sipcotPark: park });
      if (q && String(q).trim()) {
        const rx = new RegExp(escapeRegex(String(q).trim()), 'i');
        parts.push({ $or: [{ name: rx }, { type: rx }, { sipcotPark: rx }] });
      }
      const iq = parts.length > 1 ? { $and: parts } : parts[0];
      const inMatch = await Industry.find(iq).select('_id').lean();
      const ids = inMatch.map((i) => i._id);
      query.industry = { $in: ids.length ? ids : [] };
    }

    let sort = { createdAt: -1 };
    if (sortBy === 'investment') sort = { 'investment.value': -1, year: -1 };
    else if (sortBy === 'employment') sort = { 'employment.total': -1, year: -1 };

    const [total, records, stats] = await Promise.all([
      DataRecord.countDocuments(query),
      DataRecord.find(query)
        .populate('industry', 'name type sipcotPark')
        .populate('submittedBy', 'name email')
        .sort(sort)
        .skip((pageNum - 1) * limit)
        .limit(limit),
      Promise.all([
        DataRecord.countDocuments({}),
        DataRecord.countDocuments({ status: { $in: ['Submitted', 'Under Review'] } }),
        DataRecord.countDocuments({ status: 'Approved' }),
        DataRecord.countDocuments({ status: 'Rejected' }),
      ]).then(([totalAll, pending, approved, rejected]) => ({
        total: totalAll,
        pending,
        approved,
        rejected,
      })),
    ]);

    res.json({
      success: true,
      data: records,
      total,
      page: pageNum,
      pages: Math.ceil(total / limit) || 0,
      stats,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Approve / reject / mark under review
// @route PUT /api/admin/records/:id/review
exports.reviewRecord = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    if (!['Approved', 'Rejected', 'Under Review'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    if (status === 'Rejected' && !(adminRemarks && String(adminRemarks).trim())) {
      return res.status(400).json({ success: false, message: 'Remarks are required when rejecting a submission' });
    }

    const update = {
      status,
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
    };
    if (adminRemarks !== undefined && adminRemarks !== null) update.adminRemarks = adminRemarks;

    const record = await DataRecord.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('industry')
      .populate('submittedBy');

    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

    const industryId = record.industry._id || record.industry;
    const indName = record.industry.name || 'Industry';
    const remarksSnippet = adminRemarks && String(adminRemarks).trim()
      ? ` — ${String(adminRemarks).trim().slice(0, 140)}`
      : '';
    await logAudit({
      actorId: req.user.id,
      actorRole: 'admin',
      action: `record_${status.replace(/\s+/g, '_').toLowerCase()}`,
      summary: `${req.user.name} marked ${record.year} ${record.quarter} for ${indName} as ${status}${remarksSnippet}`,
      entityType: 'DataRecord',
      entityId: record._id,
      industryId,
      metadata: { status, year: record.year, quarter: record.quarter },
    });

    let msg;
    let notifType = 'info';
    if (status === 'Approved') {
      msg = `Your data submission for ${record.industry.name} (${record.year}) has been approved.`;
      notifType = 'success';
    } else if (status === 'Rejected') {
      msg = `Your data submission for ${record.industry.name} (${record.year}) was rejected. Reason: ${adminRemarks}`;
      notifType = 'error';
    } else {
      msg = `Your data submission for ${record.industry.name} (${record.year}) is under administrative review.${adminRemarks ? ` Administrator note: ${adminRemarks}` : ''}`;
      notifType = 'warning';
    }

    await User.findByIdAndUpdate(record.submittedBy._id, {
      $push: { notifications: { message: msg, type: notifType } },
    });

    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get all users (admin)
// @route GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { q, status, role } = req.query;
    const query = {};

    if (role === 'admin') query.role = 'admin';
    else if (role === 'all') query.role = { $in: ['admin', 'industry'] };
    else query.role = 'industry';

    if (status === 'active') query.isActive = true;
    else if (status === 'inactive') query.isActive = false;

    if (q && String(q).trim()) {
      const rx = new RegExp(escapeRegex(String(q).trim()), 'i');
      query.$or = [{ name: rx }, { email: rx }, { companyName: rx }];
    }

    const users = await User.find(query)
      .select('-password')
      .populate('industry', 'name type sipcotPark')
      .sort({ createdAt: -1 });

    const total = users.length;

    res.json({ success: true, data: users, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Toggle user active/deactivated
// @route PATCH /api/admin/users/:id/toggle-active
exports.toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot deactivate admin accounts' });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    await logAudit({
      actorId: req.user.id,
      actorRole: 'admin',
      action: user.isActive ? 'user_activated' : 'user_deactivated',
      summary: `${req.user.name} ${user.isActive ? 'activated' : 'deactivated'} account ${user.email}`,
      entityType: 'User',
      entityId: user._id,
      industryId: user.industry || undefined,
    });

    res.json({ success: true, data: { _id: user._id, isActive: user.isActive } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// =========================
// Announcements (Admin)
// =========================

// @desc  Create announcement
// @route POST /api/admin/announcements
exports.createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      message,
      priority = 'normal',
      audience = 'all',
      audienceValue,
      announcementType = 'general',
      effectiveDate,
    } = req.body;

    const allowedTypes = ['general', 'deadline', 'inspection', 'policy'];
    const type = allowedTypes.includes(announcementType) ? announcementType : 'general';

    const ann = await Announcement.create({
      title,
      message,
      announcementType: type,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : undefined,
      priority,
      audience,
      audienceValue: audience === 'all' ? undefined : audienceValue,
      createdBy: req.user.id,
    });
    res.status(201).json({ success: true, data: ann });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get announcements
// @route GET /api/admin/announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const { active = 'true', page = 1, limit = 20 } = req.query;
    const query = {};
    if (active === 'true') query.isActive = true;
    if (active === 'false') query.isActive = false;

    const total = await Announcement.countDocuments(query);
    const list = await Announcement.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    res.json({ success: true, data: list, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Toggle active (archive/unarchive)
// @route PATCH /api/admin/announcements/:id/toggle
exports.toggleAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found' });
    ann.isActive = !ann.isActive;
    await ann.save();
    res.json({ success: true, data: ann });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Delete announcement
// @route DELETE /api/admin/announcements/:id
exports.deleteAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findByIdAndDelete(req.params.id);
    if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// =========================
// Schedule (Admin)
// =========================

// @desc  Create schedule item
// @route POST /api/admin/schedule
exports.createScheduleItem = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      type = 'Inspection',
      audience = 'all',
      audienceValue,
      location,
      reminder24h = false,
    } = req.body;

    const allowedTypes = [
      'Inspection',
      'Submission Deadline',
      'Review Meeting',
      'Compliance Check',
      'Deadline',
      'Training',
      'Other',
    ];
    const scheduleType = allowedTypes.includes(type) ? type : 'Inspection';

    const item = await ScheduleItem.create({
      title,
      description,
      date,
      type: scheduleType,
      location: location?.trim() || undefined,
      reminder24h: Boolean(reminder24h),
      audience,
      audienceValue: audience === 'all' ? undefined : audienceValue,
      createdBy: req.user.id,
      eventStatus: 'upcoming',
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update schedule event status (upcoming / completed / cancelled)
// @route PATCH /api/admin/schedule/:id/status
exports.updateScheduleEventStatus = async (req, res) => {
  try {
    const { eventStatus } = req.body;
    if (!['upcoming', 'completed', 'cancelled'].includes(eventStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const item = await ScheduleItem.findByIdAndUpdate(
      req.params.id,
      { eventStatus },
      { new: true }
    ).populate('createdBy', 'name email');
    if (!item) return res.status(404).json({ success: false, message: 'Schedule item not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get schedule items
// @route GET /api/admin/schedule
exports.getScheduleItems = async (req, res) => {
  try {
    const { active = 'true', from, to, page = 1, limit = 20 } = req.query;
    const query = {};
    if (active === 'true') query.isActive = true;
    if (active === 'false') query.isActive = false;
    if (from || to) query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);

    const total = await ScheduleItem.countDocuments(query);
    const list = await ScheduleItem.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    res.json({ success: true, data: list, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Toggle active (archive/unarchive)
// @route PATCH /api/admin/schedule/:id/toggle
exports.toggleScheduleItem = async (req, res) => {
  try {
    const item = await ScheduleItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Schedule item not found' });
    item.isActive = !item.isActive;
    await item.save();
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Delete schedule item
// @route DELETE /api/admin/schedule/:id
exports.deleteScheduleItem = async (req, res) => {
  try {
    const item = await ScheduleItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Schedule item not found' });
    res.json({ success: true, message: 'Schedule item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
