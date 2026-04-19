/**
 * Tender Eligibility Ranking — rule-based composite score for officer decision support.
 * All sub-scores normalized to 0–100 before applying weights so magnitudes stay comparable.
 */
const DataRecord = require('../models/DataRecord');
const Industry = require('../models/Industry');

const QUARTER_RANK = { Q1: 1, Q2: 2, Q3: 3, Q4: 4, Annual: 5 };

function periodSortKey(r) {
  return r.year * 100 + (QUARTER_RANK[r.quarter] || 0);
}

function buildLatestApprovedMap(approved) {
  const byInd = new Map();
  for (const r of approved) {
    if (!r.industry) continue;
    const id = String(r.industry);
    const prev = byInd.get(id);
    if (!prev || periodSortKey(r) > periodSortKey(prev)) {
      byInd.set(id, r);
    }
  }
  return byInd;
}

/** Best approved record for industry in a given calendar year (latest period within that year). */
function latestApprovedInYear(records, industryId, year) {
  const list = records.filter(
    (r) => String(r.industry) === String(industryId) && r.status === 'Approved' && r.year === year
  );
  if (!list.length) return null;
  return list.reduce((best, r) => (periodSortKey(r) > periodSortKey(best) ? r : best));
}

function clamp01(v) {
  if (!Number.isFinite(v)) return 0;
  return Math.min(100, Math.max(0, v));
}

function rawCompliancePoints(rec) {
  let p = 0;
  if (rec.effluentTreatment) p += 10;
  if (rec.rainwaterHarvesting) p += 10;
  if (Number(rec.csrTotal) > 0) p += 10;
  return p; // 0–30
}

/**
 * submissionConsistency: last 3 reporting years (calendar) with at least one approved return.
 */
function submissionConsistencyScore(allApprovedForIndustry, currentYear) {
  const years = new Set(allApprovedForIndustry.map((r) => r.year));
  let hit = 0;
  for (let y = currentYear; y >= currentYear - 2; y--) {
    if (years.has(y)) hit += 1;
  }
  return (hit / 3) * 100;
}

function computeGrowthRatePercent(latest, prev) {
  if (!prev) return 0;
  const invC = Number(latest.investment?.value) || 0;
  const invP = Number(prev.investment?.value) || 0;
  const empC = Number(latest.employment?.total) || 0;
  const empP = Number(prev.employment?.total) || 0;

  let invG = 0;
  if (invP > 0) invG = ((invC - invP) / invP) * 100;
  let empG = 0;
  if (empP > 0) empG = ((empC - empP) / empP) * 100;

  if (invP > 0 && empP > 0) return (invG + empG) / 2;
  if (invP > 0) return invG;
  if (empP > 0) return empG;
  return 0;
}

// GET /api/admin/tender-eligible
exports.getTenderEligible = async (req, res) => {
  try {
    const THRESHOLD = Number(req.query.threshold) || 60;
    const currentYear = new Date().getFullYear();

    const allApproved = await DataRecord.find({ status: 'Approved' }).lean();
    const latestByIndustry = buildLatestApprovedMap(allApproved);

    const industries = await Industry.find({}).select('name sipcotPark type status').lean();
    const maxInv = Math.max(
      0,
      ...[...latestByIndustry.values()].map((r) => Number(r.investment?.value) || 0)
    );
    const maxEmp = Math.max(
      0,
      ...[...latestByIndustry.values()].map((r) => Number(r.employment?.total) || 0)
    );

    const rows = [];

    for (const ind of industries) {
      const id = String(ind._id);
      const latest = latestByIndustry.get(id);
      if (!latest) {
        rows.push({
          rank: null,
          industryId: id,
          industryName: ind.name,
          sipcotPark: ind.sipcotPark,
          type: ind.type,
          industryStatus: ind.status,
          score: 0,
          statusLabel: 'Average',
          components: {
            investmentNorm: 0,
            employmentNorm: 0,
            growthRate: 0,
            complianceNorm: 0,
            submissionConsistency: 0,
          },
          hasApprovedData: false,
        });
        continue;
      }

      const prev = latestApprovedInYear(allApproved, id, latest.year - 1);
      const growthRaw = computeGrowthRatePercent(latest, prev);
      const growthNorm = clamp01(growthRaw);

      const inv = Number(latest.investment?.value) || 0;
      const emp = Number(latest.employment?.total) || 0;
      const investmentNorm = maxInv > 0 ? Math.min(100, (inv / maxInv) * 100) : 0;
      const employmentNorm = maxEmp > 0 ? Math.min(100, (emp / maxEmp) * 100) : 0;

      const compRaw = rawCompliancePoints(latest);
      const complianceNorm = (compRaw / 30) * 100;

      const indApproved = allApproved.filter((r) => String(r.industry) === id);
      const submissionConsistency = submissionConsistencyScore(indApproved, currentYear);

      const score =
        investmentNorm * 0.3 +
        employmentNorm * 0.2 +
        growthNorm * 0.2 +
        complianceNorm * 0.2 +
        submissionConsistency * 0.1;

      const rounded = Math.round(score * 10) / 10;

      rows.push({
        rank: null,
        industryId: id,
        industryName: ind.name,
        sipcotPark: ind.sipcotPark,
        type: ind.type,
        industryStatus: ind.status,
        score: rounded,
        statusLabel: rounded > THRESHOLD ? 'Recommended' : 'Average',
        components: {
          investmentNorm: Math.round(investmentNorm * 10) / 10,
          employmentNorm: Math.round(employmentNorm * 10) / 10,
          growthRate: Math.round(growthNorm * 10) / 10,
          complianceNorm: Math.round(complianceNorm * 10) / 10,
          submissionConsistency: Math.round(submissionConsistency * 10) / 10,
        },
        hasApprovedData: true,
        latestPeriod: `${latest.year} ${latest.quarter}`,
      });
    }

    rows.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return String(a.industryName || '').localeCompare(String(b.industryName || ''));
    });
    rows.forEach((row, i) => {
      row.rank = i + 1;
    });

    res.json({
      success: true,
      data: rows,
      meta: {
        threshold: THRESHOLD,
        maxInvestment: maxInv,
        maxEmployment: maxEmp,
        weights: {
          investment: 0.3,
          employment: 0.2,
          growthRate: 0.2,
          compliance: 0.2,
          submissionConsistency: 0.1,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
