// controllers/industryController.js
const Industry = require('../models/Industry');
const User = require('../models/User');
const { logAudit } = require('../utils/auditLog');

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// @desc  Register industry (user)
// @route POST /api/industries
exports.registerIndustry = async (req, res) => {
  try {
    const existing = await Industry.findOne({ user: req.user.id });
    if (existing) return res.status(400).json({ success: false, message: 'Industry already registered for this account' });

    const body = { ...req.body };
    delete body.registrationNumber;
    delete body.user;
    const seq = (await Industry.countDocuments()) + 1;
    const registrationNumber = `SIPCOT/TN/${new Date().getFullYear()}/${String(seq).padStart(5, '0')}`;
    const industry = await Industry.create({ ...body, registrationNumber, user: req.user.id });
    await User.findByIdAndUpdate(req.user.id, { industry: industry._id });

    await logAudit({
      actorId: req.user.id,
      actorRole: 'industry',
      action: 'industry_registered',
      summary: `${req.user.name} registered unit "${industry.name}" (${industry.registrationNumber})`,
      entityType: 'Industry',
      entityId: industry._id,
      industryId: industry._id,
    });

    res.status(201).json({ success: true, data: industry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get my industry
// @route GET /api/industries/my
exports.getMyIndustry = async (req, res) => {
  try {
    const industry = await Industry.findOne({ user: req.user.id });
    res.json({ success: true, data: industry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update my industry
// @route PUT /api/industries/my
exports.updateMyIndustry = async (req, res) => {
  try {
    const body = { ...req.body };
    delete body.registrationNumber;
    delete body.sipcotPark;
    delete body.user;
    const industry = await Industry.findOneAndUpdate({ user: req.user.id }, body, { new: true, runValidators: true });

    await logAudit({
      actorId: req.user.id,
      actorRole: 'industry',
      action: 'industry_profile_updated',
      summary: `${req.user.name} updated My Industry profile`,
      entityType: 'Industry',
      entityId: industry._id,
      industryId: industry._id,
    });

    res.json({ success: true, data: industry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Admin - Get all industries
// @route GET /api/industries
exports.getAllIndustries = async (req, res) => {
  try {
    const { type, category, sipcotPark, status, search, page = 1, limit: limitQ = 20, sortBy = 'recent' } = req.query;
    const limit = Math.min(100, Math.max(1, parseInt(limitQ, 10) || 20));
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (sipcotPark) query.sipcotPark = sipcotPark;
    if (status) query.status = status;
    if (search && String(search).trim()) {
      const q = escapeRegex(String(search).trim());
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { registrationNumber: { $regex: q, $options: 'i' } },
        { 'location.city': { $regex: q, $options: 'i' } },
        { 'location.district': { $regex: q, $options: 'i' } },
        { 'location.address': { $regex: q, $options: 'i' } },
      ];
    }

    const registryTotal = await Industry.countDocuments({});

    let sort = { createdAt: -1 };
    if (sortBy === 'name') sort = { name: 1 };
    else if (sortBy === 'park') sort = { sipcotPark: 1, name: 1 };

    const total = await Industry.countDocuments(query);
    const industries = await Industry.find(query)
      .populate('user', 'name email phone isActive')
      .sort(sort)
      .skip((pageNum - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: industries,
      total,
      registryTotal,
      page: pageNum,
      pages: Math.ceil(total / limit) || 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Admin - Get single industry
// @route GET /api/industries/:id
exports.getIndustry = async (req, res) => {
  try {
    const industry = await Industry.findById(req.params.id).populate('user', 'name email phone isActive');
    if (!industry) return res.status(404).json({ success: false, message: 'Industry not found' });
    res.json({ success: true, data: industry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Admin - Add industry
// @route POST /api/industries/admin
exports.adminAddIndustry = async (req, res) => {
  try {
    const industry = await Industry.create(req.body);
    res.status(201).json({ success: true, data: industry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Admin - Update industry
// @route PUT /api/industries/:id
exports.adminUpdateIndustry = async (req, res) => {
  try {
    const industry = await Industry.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!industry) return res.status(404).json({ success: false, message: 'Industry not found' });
    res.json({ success: true, data: industry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Admin - Delete industry
// @route DELETE /api/industries/:id
exports.adminDeleteIndustry = async (req, res) => {
  try {
    const industry = await Industry.findByIdAndDelete(req.params.id);
    if (!industry) return res.status(404).json({ success: false, message: 'Industry not found' });
    res.json({ success: true, message: 'Industry deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
