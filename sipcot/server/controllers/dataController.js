// controllers/dataController.js
const DataRecord = require('../models/DataRecord');
const User = require('../models/User');
const { logAudit } = require('../utils/auditLog');
const { computeDataAnomalies, findBaselineRecord } = require('../utils/dataAnomalies');

function coerceEmployment(emp) {
  const n = (v) => {
    if (v === '' || v === null || v === undefined) return 0;
    const x = Number(v);
    return Number.isFinite(x) ? Math.round(x) : 0;
  };
  return {
    total: n(emp?.total),
    male: n(emp?.male),
    female: n(emp?.female),
    skilled: n(emp?.skilled),
    unskilled: n(emp?.unskilled),
    local: n(emp?.local),
  };
}

function employmentBalanceError(emp) {
  const e = coerceEmployment(emp);
  if (e.total < 0 || e.male < 0 || e.female < 0 || e.skilled < 0 || e.unskilled < 0 || e.local < 0) {
    return 'Employment figures must be non-negative numbers.';
  }
  if (e.male + e.female !== e.total) {
    return 'Male + Female must equal Total employment.';
  }
  if (e.skilled + e.unskilled !== e.total) {
    return 'Skilled + Unskilled must equal Total employment.';
  }
  return null;
}

// @desc  Preview rule-based anomaly flags (no save)
// @route POST /api/data/anomalies-preview
exports.anomaliesPreview = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('industry');
    if (!user.industry) return res.json({ success: true, anomalies: [] });

    const year = parseInt(req.body.year, 10);
    const quarter = req.body.quarter;
    const excludeId = req.body.excludeRecordId || null;
    const baseline = await findBaselineRecord(user.industry._id, year, quarter, excludeId);
    const anomalies = computeDataAnomalies(baseline, req.body);
    res.json({ success: true, anomalies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Submit data record
// @route POST /api/data
exports.submitData = async (req, res) => {
  try {
    const {
      year,
      quarter,
      investment,
      employment,
      waterUsage,
      powerUsage,
      turnover,
      exports: exp,
      csrActivities,
      csrTotal,
      effluentTreatment,
      sewageTreatmentPlant,
      wasteManagementInPlace,
      rainwaterHarvesting,
      solarPower,
    } = req.body;
    const user = await User.findById(req.user.id).populate('industry');
    if (!user.industry) return res.status(400).json({ success: false, message: 'Please register your industry first' });

    const y = parseInt(year, 10);
    const q = quarter;
    const existing = await DataRecord.findOne({ industry: user.industry._id, year: y, quarter: q });
    if (existing) return res.status(400).json({ success: false, message: 'You already submitted data for this period. Open My Submissions to view or edit it.' });

    const empErr = employmentBalanceError(employment);
    if (empErr) return res.status(400).json({ success: false, message: empErr });

    const record = await DataRecord.create({
      industry: user.industry._id,
      submittedBy: req.user.id,
      year: y,
      quarter: q,
      investment,
      employment: coerceEmployment(employment),
      waterUsage,
      powerUsage,
      turnover,
      exports: exp,
      csrActivities,
      csrTotal,
      effluentTreatment,
      sewageTreatmentPlant,
      wasteManagementInPlace,
      rainwaterHarvesting,
      solarPower,
      status: 'Submitted',
      submittedAt: new Date(),
    });

    const baseline = await findBaselineRecord(user.industry._id, y, q);
    const anomalies = computeDataAnomalies(baseline, req.body);

    await logAudit({
      actorId: req.user.id,
      actorRole: 'industry',
      action: 'data_submitted',
      summary: `${user.name} submitted ${y} ${q} MIS return`,
      entityType: 'DataRecord',
      entityId: record._id,
      industryId: user.industry._id,
      metadata: { year: y, quarter: q, anomalyCodes: anomalies.map((a) => a.code) },
    });

    res.status(201).json({ success: true, data: record, anomalies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get my data records
// @route GET /api/data/my
exports.getMyData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.industry) return res.json({ success: true, data: [] });
    const records = await DataRecord.find({ industry: user.industry }).sort({ year: -1, createdAt: -1 });
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update data record
// @route PUT /api/data/:id
exports.updateData = async (req, res) => {
  try {
    let record = await DataRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    if (record.submittedBy.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    if (record.status === 'Approved') return res.status(400).json({ success: false, message: 'Cannot edit approved record' });

    const { year, quarter, employment } = req.body;
    if (employment !== undefined) {
      const empErr = employmentBalanceError(employment);
      if (empErr) return res.status(400).json({ success: false, message: empErr });
    }
    const y = year !== undefined ? parseInt(year, 10) : record.year;
    const q = quarter !== undefined ? quarter : record.quarter;
    if ((year !== undefined || quarter !== undefined) && (y !== record.year || q !== record.quarter)) {
      const clash = await DataRecord.findOne({
        industry: record.industry,
        year: y,
        quarter: q,
        _id: { $ne: record._id },
      });
      if (clash) return res.status(400).json({ success: false, message: 'Another submission already exists for that period.' });
    }

    const patch = {
      ...req.body,
      status: 'Submitted',
      submittedAt: new Date(),
    };
    if (employment !== undefined) patch.employment = coerceEmployment(employment);
    if (year !== undefined) patch.year = y;

    record = await DataRecord.findByIdAndUpdate(req.params.id, patch, { new: true });

    const merged = record.toObject();
    const baseline = await findBaselineRecord(record.industry, merged.year, merged.quarter, req.params.id);
    const anomalies = computeDataAnomalies(baseline, merged);

    await logAudit({
      actorId: req.user.id,
      actorRole: 'industry',
      action: 'data_resubmitted',
      summary: `${req.user.name} resubmitted ${merged.year} ${merged.quarter} return`,
      entityType: 'DataRecord',
      entityId: record._id,
      industryId: record.industry,
      metadata: { year: merged.year, quarter: merged.quarter, anomalyCodes: anomalies.map((a) => a.code) },
    });

    res.json({ success: true, data: record, anomalies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Delete data record
// @route DELETE /api/data/:id
exports.deleteData = async (req, res) => {
  try {
    const record = await DataRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    if (record.submittedBy.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

    await logAudit({
      actorId: req.user.id,
      actorRole: 'industry',
      action: 'data_deleted',
      summary: `${req.user.name} deleted ${record.year} ${record.quarter} submission`,
      entityType: 'DataRecord',
      entityId: record._id,
      industryId: record.industry,
      metadata: { year: record.year, quarter: record.quarter },
    });

    await record.deleteOne();
    res.json({ success: true, message: 'Record deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
