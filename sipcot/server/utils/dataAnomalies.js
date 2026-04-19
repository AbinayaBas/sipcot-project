const DataRecord = require('../models/DataRecord');

function num(v) {
  if (v === null || v === undefined || v === '') return 0;
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

/**
 * Rule-based checks against a prior submission (YoY same quarter preferred, else latest record).
 */
function computeDataAnomalies(baseline, incoming) {
  const alerts = [];
  if (!baseline) return alerts;

  const pe = num(baseline.employment?.total);
  const ce = num(incoming.employment?.total);

  if (pe >= 5 && ce > 0 && ce < pe * 0.6) {
    const pct = Math.round((1 - ce / pe) * 100);
    alerts.push({
      code: 'employment_drop',
      severity: 'warning',
      message: `Total employment is about ${pct}% lower than the reference period (${pe} → ${ce}). Confirm this matches your records.`,
    });
  }

  if (pe >= 5 && ce > pe * 3) {
    alerts.push({
      code: 'employment_surge',
      severity: 'info',
      message: `Total employment is much higher than the reference period (${pe} → ${ce}). Confirm expansion or corrected data.`,
    });
  }

  const pi = num(baseline.investment?.value);
  const ci = num(incoming.investment?.value);
  if (pi > 1 && ci >= pi * 2.5) {
    alerts.push({
      code: 'investment_spike',
      severity: 'warning',
      message: `Investment is about ${(ci / pi).toFixed(1)}× the reference period — check for ₹ / entry mistakes.`,
    });
  }

  const pt = num(baseline.turnover?.value);
  const ct = num(incoming.turnover?.value);
  if (pt > 5 && ct < pt * 0.5) {
    alerts.push({
      code: 'turnover_drop',
      severity: 'warning',
      message: 'Turnover is less than half of the reference period — verify before submitting.',
    });
  }

  if (pt > 1 && ct === 0) {
    alerts.push({
      code: 'turnover_zero',
      severity: 'warning',
      message: 'Turnover is zero while a reference period had positive turnover.',
    });
  }

  const pwr = num(baseline.powerUsage?.value);
  const cwr = num(incoming.powerUsage?.value);
  if (pe > 10 && pwr > 100 && cwr > pwr * 2.5) {
    alerts.push({
      code: 'power_spike',
      severity: 'info',
      message: 'Power usage is sharply higher vs reference — confirm production level or metering.',
    });
  }

  return alerts;
}

async function findBaselineRecord(industryId, year, quarter, excludeId) {
  const ex = excludeId ? { _id: { $ne: excludeId } } : {};
  const priorYear = await DataRecord.findOne({
    industry: industryId,
    year: year - 1,
    quarter,
    ...ex,
  }).sort({ updatedAt: -1 });
  if (priorYear) return priorYear;

  const q = { industry: industryId, ...ex };
  return DataRecord.findOne(q).sort({ year: -1, createdAt: -1 });
}

module.exports = { computeDataAnomalies, findBaselineRecord };
