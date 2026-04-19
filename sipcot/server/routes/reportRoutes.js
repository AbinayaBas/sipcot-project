// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Industry = require('../models/Industry');

async function buildApprovedRecordQuery(year, park) {
  const query = { status: 'Approved' };
  const y = year != null && String(year).trim() !== '' ? parseInt(year, 10) : NaN;
  if (!Number.isNaN(y)) query.year = y;
  if (park && String(park).trim()) {
    const inds = await Industry.find({ sipcotPark: park }).select('_id').lean();
    query.industry = { $in: inds.map((i) => i._id) };
  }
  return query;
}

router.get('/export/excel', protect, authorize('admin'), async (req, res) => {
  try {
    const XLSX = require('xlsx');
    const DataRecord = require('../models/DataRecord');
    const { year, park } = req.query;

    const recordQuery = await buildApprovedRecordQuery(year, park);
    const records = await DataRecord.find(recordQuery).populate('industry', 'name type sipcotPark').lean();

    const data = records.map((r) => ({
      Industry: r.industry?.name || 'N/A',
      Type: r.industry?.type || 'N/A',
      'SIPCOT Park': r.industry?.sipcotPark || 'N/A',
      Year: r.year,
      Quarter: r.quarter,
      'Investment (Lakhs)': r.investment?.value || 0,
      'Turnover (Lakhs)': r.turnover?.value || 0,
      'Total Employees': r.employment?.total || 0,
      Male: r.employment?.male ?? 0,
      Female: r.employment?.female ?? 0,
      Skilled: r.employment?.skilled ?? 0,
      Local: r.employment?.local ?? 0,
      'Water Usage (KLD)': r.waterUsage?.value || 0,
      'Power Usage (KWH)': r.powerUsage?.value || 0,
      'CSR Amount': r.csrTotal || 0,
      'Effluent treatment': r.effluentTreatment ? 'Yes' : 'No',
      'Rainwater harvesting': r.rainwaterHarvesting ? 'Yes' : 'No',
      'Solar (kW)': r.solarPower ?? 0,
      Status: r.status,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data.length ? data : [{ Note: 'No approved records match the selected filters.' }]);
    XLSX.utils.book_append_sheet(wb, ws, 'Approved Data');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const yLabel = year || 'AllYears';
    const pLabel = (park || 'AllParks').replace(/\s+/g, '_');
    const fname = `SIPCOT_Approved_Data_${yLabel}_${pLabel}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename=${fname}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/export/summary', protect, authorize('admin'), async (req, res) => {
  try {
    const XLSX = require('xlsx');
    const DataRecord = require('../models/DataRecord');
    const { year, park } = req.query;

    const match = { status: 'Approved' };
    const y = year != null && String(year).trim() !== '' ? parseInt(year, 10) : NaN;
    if (!Number.isNaN(y)) match.year = y;

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'industries',
          localField: 'industry',
          foreignField: '_id',
          as: 'industryDoc',
        },
      },
      { $unwind: '$industryDoc' },
    ];
    if (park) pipeline.push({ $match: { 'industryDoc.sipcotPark': park } });

    pipeline.push({
      $group: {
        _id: '$industryDoc.sipcotPark',
        approvedRecords: { $sum: 1 },
        totalInvestmentLakhs: { $sum: '$investment.value' },
        totalTurnoverLakhs: { $sum: '$turnover.value' },
        totalEmployment: { $sum: '$employment.total' },
        totalWaterKLD: { $sum: '$waterUsage.value' },
        totalPowerKWH: { $sum: '$powerUsage.value' },
        totalCSR: { $sum: '$csrTotal' },
      },
    });
    pipeline.push({ $sort: { _id: 1 } });

    const agg = await DataRecord.aggregate(pipeline);

    const data = agg.map((row) => ({
      'Industrial park': row._id || 'Unknown',
      'Approved records': row.approvedRecords,
      'Total investment (Lakhs INR)': Math.round(row.totalInvestmentLakhs * 100) / 100,
      'Total turnover (Lakhs INR)': Math.round(row.totalTurnoverLakhs * 100) / 100,
      'Total employment': row.totalEmployment,
      'Total water (KLD)': Math.round(row.totalWaterKLD * 100) / 100,
      'Total power (KWH/mo)': Math.round(row.totalPowerKWH * 100) / 100,
      'Total CSR (Lakhs INR)': Math.round(row.totalCSR * 100) / 100,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(
      data.length ? data : [{ Note: 'No approved records match the selected filters for this summary.' }]
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Park summary');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const yLabel = year || 'AllYears';
    const pLabel = (park || 'AllParks').replace(/\s+/g, '_');
    const fname = `SIPCOT_Summary_${yLabel}_${pLabel}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename=${fname}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// User notifications
router.get('/notifications', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('notifications');
    res.json({ success: true, data: user.notifications?.reverse() || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/notifications/read', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, { $set: { 'notifications.$[].read': true } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
