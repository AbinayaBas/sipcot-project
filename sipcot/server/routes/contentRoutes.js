const express = require('express');
const fs = require('fs');

function buildDocumentCategoryQuery(category) {
  if (!category) return {};
  if (category === 'Circular / Notice') return { category: { $in: ['Circular / Notice', 'Circular'] } };
  if (category === 'Form / Template') return { category: { $in: ['Form / Template', 'Form'] } };
  return { category };
}

const { protect } = require('../middleware/auth');
const Announcement = require('../models/Announcement');
const ScheduleItem = require('../models/ScheduleItem');
const Document = require('../models/Document');
const Industry = require('../models/Industry');

const router = express.Router();

async function getIndustryForUser(userId) {
  const industry = await Industry.findOne({ user: userId }).select('sipcotPark type name');
  return industry;
}

function buildAudienceQuery(industry) {
  // Public (all) + targeted by park/type
  const or = [{ audience: 'all' }];
  if (industry?.sipcotPark) or.push({ audience: 'park', audienceValue: industry.sipcotPark });
  if (industry?.type) or.push({ audience: 'type', audienceValue: industry.type });
  return { $or: or };
}

// =========================
// Announcements (Industry read)
// =========================
router.get('/announcements', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const industry = await getIndustryForUser(req.user.id);
    const query = { isActive: true, ...buildAudienceQuery(industry) };

    const total = await Announcement.countDocuments(query);
    const list = await Announcement.find(query)
      .select(
        'title message priority audience audienceValue createdAt announcementType effectiveDate'
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    res.json({ success: true, data: list, total, pages: Math.ceil(total / limit), industry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =========================
// Schedule (Industry read)
// =========================
router.get('/schedule', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, upcoming = 'true' } = req.query;
    const industry = await getIndustryForUser(req.user.id);
    const query = {
      isActive: true,
      eventStatus: { $ne: 'cancelled' },
      ...buildAudienceQuery(industry),
    };
    if (upcoming === 'true') query.date = { $gte: new Date(Date.now() - 2 * 60 * 60 * 1000) }; // include recent

    const total = await ScheduleItem.countDocuments(query);
    const list = await ScheduleItem.find(query)
      .select(
        'title description date type location reminder24h eventStatus audience audienceValue createdAt'
      )
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    res.json({ success: true, data: list, total, pages: Math.ceil(total / limit), industry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =========================
// Documents (Industry read)
// =========================
router.get('/documents', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const industry = await getIndustryForUser(req.user.id);
    const query = { isActive: true, ...buildAudienceQuery(industry), ...buildDocumentCategoryQuery(category) };

    const total = await Document.countDocuments(query);
    const list = await Document.find(query)
      .select(
        'title description category versionYear audience audienceValue createdAt updatedAt downloadCount file.originalName file.size file.mimeType'
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    res.json({ success: true, data: list, total, pages: Math.ceil(total / limit), industry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/documents/:id/download', protect, async (req, res) => {
  try {
    const industry = await getIndustryForUser(req.user.id);
    const query = { _id: req.params.id, isActive: true, ...buildAudienceQuery(industry) };
    const doc = await Document.findOne(query);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    if (!doc.file?.path || !fs.existsSync(doc.file.path)) return res.status(404).json({ success: false, message: 'File missing' });
    await Document.findByIdAndUpdate(doc._id, { $inc: { downloadCount: 1 } });
    return res.download(doc.file.path, doc.file.originalName || 'document');
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

