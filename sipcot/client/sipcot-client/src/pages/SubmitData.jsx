import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { anomaliesPreview, getMyData, getMyIndustry, submitData, updateData } from '../utils/api';

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4', 'Annual'];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

const empty = {
  year: currentYear,
  quarter: 'Annual',
  investment: { value: '', unit: 'Lakhs INR' },
  turnover: { value: '', unit: 'Lakhs INR' },
  employment: { total: '', male: '', female: '', skilled: '', unskilled: '', local: '' },
  waterUsage: { value: '', unit: 'KLD' },
  powerUsage: { value: '', unit: 'kWh/month' },
  effluentTreatment: false,
  sewageTreatmentPlant: false,
  wasteManagementInPlace: false,
  rainwaterHarvesting: false,
  solarPower: '',
  csrTotal: '',
  csrActivities: [],
};

function num(v) {
  if (v === '' || v === null || v === undefined) return 0;
  const x = Number(v);
  return Number.isFinite(x) ? Math.round(x) : 0;
}

function employmentClientError(emp) {
  const e = {
    total: num(emp?.total),
    male: num(emp?.male),
    female: num(emp?.female),
    skilled: num(emp?.skilled),
    unskilled: num(emp?.unskilled),
  };
  if (e.male + e.female !== e.total) {
    return 'Male + Female must equal Total employment.';
  }
  if (e.skilled + e.unskilled !== e.total) {
    return 'Skilled + Unskilled must equal Total employment.';
  }
  return null;
}

/** Required numeric fields + minimum employment for a credible MIS return */
function validateIntegrity(form) {
  const errs = [];
  const iv = form.investment?.value;
  const tv = form.turnover?.value;
  if (iv === '' || iv === null || Number.isNaN(Number(iv))) errs.push('Investment (₹ Lakhs) is required.');
  else if (Number(iv) < 0) errs.push('Investment cannot be negative.');
  if (tv === '' || tv === null || Number.isNaN(Number(tv))) errs.push('Turnover (₹ Lakhs) is required.');
  else if (Number(tv) < 0) errs.push('Turnover cannot be negative.');
  const wt = form.waterUsage?.value;
  const pw = form.powerUsage?.value;
  if (wt !== '' && wt != null && !Number.isNaN(Number(wt)) && Number(wt) < 0) errs.push('Water usage cannot be negative.');
  if (pw !== '' && pw != null && !Number.isNaN(Number(pw)) && Number(pw) < 0) errs.push('Power usage cannot be negative.');
  if (num(form.employment.total) < 1) errs.push('Total employment must be at least 1.');
  const sp = form.solarPower;
  if (sp !== '' && sp != null && !Number.isNaN(Number(sp)) && Number(sp) < 0) errs.push('Solar capacity cannot be negative.');
  const csr = form.csrTotal;
  if (csr !== '' && csr != null && !Number.isNaN(Number(csr)) && Number(csr) < 0) errs.push('CSR total cannot be negative.');
  return errs;
}

function recordToForm(r) {
  return {
    year: r.year,
    quarter: r.quarter,
    investment: {
      value: r.investment?.value ?? '',
      unit: r.investment?.unit || 'Lakhs INR',
    },
    turnover: {
      value: r.turnover?.value ?? '',
      unit: r.turnover?.unit || 'Lakhs INR',
    },
    employment: {
      total: r.employment?.total ?? '',
      male: r.employment?.male ?? '',
      female: r.employment?.female ?? '',
      skilled: r.employment?.skilled ?? '',
      unskilled: r.employment?.unskilled ?? '',
      local: r.employment?.local ?? '',
    },
    waterUsage: {
      value: r.waterUsage?.value ?? '',
      unit: r.waterUsage?.unit || 'KLD',
    },
    powerUsage: {
      value: r.powerUsage?.value ?? '',
      unit: r.powerUsage?.unit || 'kWh/month',
    },
    effluentTreatment: !!r.effluentTreatment,
    sewageTreatmentPlant: !!r.sewageTreatmentPlant,
    wasteManagementInPlace: !!r.wasteManagementInPlace,
    rainwaterHarvesting: !!r.rainwaterHarvesting,
    solarPower: r.solarPower ?? '',
    csrTotal: r.csrTotal ?? '',
    csrActivities: Array.isArray(r.csrActivities) ? r.csrActivities : [],
  };
}

export default function SubmitData() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldHint, setFieldHint] = useState('');
  const [hasIndustry, setHasIndustry] = useState(true);
  const [records, setRecords] = useState([]);
  const [editBlocked, setEditBlocked] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getMyIndustry(), getMyData()])
      .then(([indRes, dataRes]) => {
        const ind = indRes.data.data;
        setHasIndustry(!!ind);
        setRecords(dataRes.data.data || []);
      })
      .finally(() => setBootLoading(false));
  }, []);

  const periodKey = (y, q) => `${y}-${q}`;

  const takenPeriods = useMemo(() => {
    const s = new Set();
    (records || []).forEach((r) => {
      if (editId && String(r._id) === String(editId)) return;
      s.add(periodKey(r.year, r.quarter));
    });
    return s;
  }, [records, editId]);

  const yNum = Number(form.year);
  const isPeriodTaken = takenPeriods.has(periodKey(yNum, form.quarter));
  const allPeriodsTakenForYear = QUARTERS.every((q) => takenPeriods.has(periodKey(yNum, q)));

  useEffect(() => {
    if (editId) return;
    if (!records.length) return;
    const tp = new Set(records.map((r) => periodKey(r.year, r.quarter)));
    setForm((prev) => {
      const py = Number(prev.year);
      if (!tp.has(periodKey(py, prev.quarter))) return prev;
      const freeSameYear = QUARTERS.find((q) => !tp.has(periodKey(py, q)));
      if (freeSameYear) return { ...prev, quarter: freeSameYear };
      for (const yy of years) {
        const f = QUARTERS.find((q) => !tp.has(periodKey(yy, q)));
        if (f) return { ...prev, year: yy, quarter: f };
      }
      return prev;
    });
  }, [records, editId]);

  useEffect(() => {
    setEditBlocked('');
    if (!editId || bootLoading) return;
    const rec = records.find((r) => String(r._id) === String(editId));
    if (!rec) {
      setEditBlocked('That submission could not be found. Open My Submissions and try again.');
      return;
    }
    if (rec.status === 'Approved') {
      setEditBlocked('This submission is already approved and cannot be edited.');
      return;
    }
    setForm({ ...empty, ...recordToForm(rec) });
  }, [editId, records, bootLoading]);

  const setNested = (path, val) => {
    const keys = path.split('.');
    setForm((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = val;
      return next;
    });
  };
  const fi = (path) => (e) => setNested(path, e.target.type === 'checkbox' ? e.target.checked : e.target.value);

  const addCsrActivity = () => {
    setForm((prev) => ({
      ...prev,
      csrActivities: [
        ...(Array.isArray(prev.csrActivities) ? prev.csrActivities : []),
        { activity: '', amount: '', beneficiaries: '', description: '' },
      ],
    }));
  };

  const removeCsrActivity = (idx) => {
    setForm((prev) => ({
      ...prev,
      csrActivities: (Array.isArray(prev.csrActivities) ? prev.csrActivities : []).filter((_, i) => i !== idx),
    }));
  };

  const updateCsrActivity = (idx, key, value) => {
    setForm((prev) => {
      const list = Array.isArray(prev.csrActivities) ? [...prev.csrActivities] : [];
      const row = { ...(list[idx] || {}) };
      row[key] = value;
      list[idx] = row;
      return { ...prev, csrActivities: list };
    });
  };

  const buildPayload = () => ({
    year: Number(form.year),
    quarter: form.quarter,
    investment: {
      value: form.investment.value === '' ? 0 : Number(form.investment.value),
      unit: form.investment.unit || 'Lakhs INR',
    },
    turnover: {
      value: form.turnover.value === '' ? 0 : Number(form.turnover.value),
      unit: form.turnover.unit || 'Lakhs INR',
    },
    employment: {
      total: num(form.employment.total),
      male: num(form.employment.male),
      female: num(form.employment.female),
      skilled: num(form.employment.skilled),
      unskilled: num(form.employment.unskilled),
      local: num(form.employment.local),
    },
    waterUsage: {
      value: form.waterUsage.value === '' ? 0 : Number(form.waterUsage.value),
      unit: form.waterUsage.unit || 'KLD',
    },
    powerUsage: {
      value: form.powerUsage.value === '' ? 0 : Number(form.powerUsage.value),
      unit: form.powerUsage.unit || 'kWh/month',
    },
    effluentTreatment: form.effluentTreatment,
    sewageTreatmentPlant: form.sewageTreatmentPlant,
    wasteManagementInPlace: form.wasteManagementInPlace,
    rainwaterHarvesting: form.rainwaterHarvesting,
    solarPower: form.solarPower === '' ? 0 : Number(form.solarPower),
    csrTotal: form.csrTotal === '' ? 0 : Number(form.csrTotal),
    csrActivities: (form.csrActivities || []).map((a) => ({
      activity: a?.activity || '',
      amount: a?.amount === '' || a?.amount == null ? 0 : Number(a.amount),
      beneficiaries: a?.beneficiaries === '' || a?.beneficiaries == null ? 0 : Number(a.beneficiaries),
      description: a?.description || '',
    })),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldHint('');

    if (!hasIndustry) {
      setError('Register your industry before submitting data.');
      return;
    }

    if (editBlocked) {
      setError(editBlocked);
      return;
    }

    if (!editId && (isPeriodTaken || allPeriodsTakenForYear)) {
      setError('You already submitted for this reporting period. Use My Submissions to view or update that record.');
      return;
    }

    const integrityErrs = validateIntegrity(form);
    if (integrityErrs.length > 0) {
      setFieldHint(integrityErrs[0]);
      setError(integrityErrs.join(' '));
      return;
    }

    const empErr = employmentClientError(form.employment);
    if (empErr) {
      setFieldHint(empErr);
      setError('Please correct employment totals before submitting.');
      return;
    }

    setLoading(true);
    try {
      const payload = buildPayload();
      const preview = await anomaliesPreview({
        ...payload,
        excludeRecordId: editId || undefined,
      });
      const flags = preview.data?.anomalies || [];
      if (flags.length) {
        const lines = flags.map((a) => a.message).join('\n\n');
        if (!window.confirm(`The system detected possible anomalies compared to a prior return (rule-based checks, not a forecast):\n\n${lines}\n\nSubmit this return anyway?`)) {
          setLoading(false);
          return;
        }
      }

      if (editId) {
        const res = await updateData(editId, payload);
        const n = res.data?.anomalies?.length;
        setSuccess(
          n
            ? `Updated successfully — your return was resubmitted for admin review. (${n} automatic data check(s) attached for review.)`
            : 'Updated successfully — your return was resubmitted for admin review.'
        );
      } else {
        const res = await submitData(payload);
        const n = res.data?.anomalies?.length;
        setSuccess(
          n
            ? `Data submitted successfully. ${n} automatic data check(s) were attached for review.`
            : 'Data submitted successfully'
        );
      }
      setTimeout(() => navigate('/data/my'), 2200);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  if (bootLoading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>{editId ? 'Edit & resubmit return' : 'Submit Data'}</h1>
        <p>
          {editId
            ? 'Update figures for this reporting period and resubmit — the status will return to Submitted for admin review.'
            : 'Periodic MIS-style return for your industrial unit'}
        </p>
      </div>

      <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(104,211,145,0.35)', background: 'rgba(104,211,145,0.06)' }}>
        <div className="section-title" style={{ marginBottom: 10 }}>Before you submit</div>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
          <li>Ensure employment breakdowns match the <strong style={{ color: 'var(--text)' }}>total</strong> (Male + Female; Skilled + Unskilled).</li>
          <li>Use figures consistent with your <strong style={{ color: 'var(--text)' }}>audited accounts / MIS</strong> for the same period.</li>
          <li>Avoid rough estimates where statutory returns expect verified numbers.</li>
          <li>You cannot create a duplicate for the same year and quarter — update the existing row in <Link to="/data/my">My Submissions</Link> instead.</li>
        </ul>
      </div>

      {editBlocked && (
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          {editBlocked} <Link to="/data/my">Back to My Submissions</Link>
        </div>
      )}

      {!hasIndustry && (
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          Complete <Link to="/industry">My Industry</Link> registration before submitting returns.
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}
      {success && (
        <div className="alert alert-success" role="status">
          {success}. Redirecting to My Submissions…
        </div>
      )}
      {fieldHint && !success && <div className="alert alert-error">{fieldHint}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title">Report period</div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: 14 }}>
            {editId
              ? 'Reporting period is locked while you edit this row — you are updating the existing submission only.'
              : 'Each year + quarter (or Annual) can only be filed once. Periods you already filed are marked below.'}
          </p>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Year</label>
              <select className="form-select" value={form.year} onChange={fi('year')} disabled={!!editId}>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quarter / period</label>
              <select className="form-select" value={form.quarter} onChange={fi('quarter')} disabled={!!editId}>
                {QUARTERS.map((q) => {
                  const taken = takenPeriods.has(periodKey(yNum, q));
                  return (
                    <option key={q} value={q} disabled={!editId && taken}>
                      {q}
                      {!editId && taken ? ' — already submitted' : ''}
                    </option>
                  );
                })}
              </select>
              {allPeriodsTakenForYear ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>
                  All periods for {yNum} are already filed — choose another year or edit an existing submission.
                </span>
              ) : isPeriodTaken ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>You already submitted for this period.</span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title">Financial data</div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: 14 }}>
            Enter values in <strong style={{ color: 'var(--text)' }}>₹ Lakhs</strong> — same basis as audited / MIS figures for this period.
          </p>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Investment (₹ Lakhs)</label>
              <input className="form-input" type="number" step="0.01" min="0" value={form.investment.value} onChange={fi('investment.value')} placeholder="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Turnover (₹ Lakhs)</label>
              <input className="form-input" type="number" step="0.01" min="0" value={form.turnover.value} onChange={fi('turnover.value')} placeholder="0" />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title">Employment</div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: 14 }}>
            Headcount rules: <strong style={{ color: 'var(--text)' }}>Male + Female = Total</strong> and{' '}
            <strong style={{ color: 'var(--text)' }}>Skilled + Unskilled = Total</strong> (numbers are cross-checked on save).
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
            {[
              ['Total', 'employment.total'],
              ['Male', 'employment.male'],
              ['Female', 'employment.female'],
              ['Skilled', 'employment.skilled'],
              ['Unskilled', 'employment.unskilled'],
              ['Local', 'employment.local'],
            ].map(([label, path]) => (
              <div className="form-group" key={path}>
                <label className="form-label">{label}</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  value={path.split('.').reduce((o, k) => o?.[k], form) ?? ''}
                  onChange={fi(path)}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title">Resource usage</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Water usage</label>
              <input className="form-input" type="number" step="0.01" min="0" value={form.waterUsage.value} onChange={fi('waterUsage.value')} placeholder="0" />
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>KLD — kilolitres per day</span>
            </div>
            <div className="form-group">
              <label className="form-label">Power usage</label>
              <input className="form-input" type="number" step="1" min="0" value={form.powerUsage.value} onChange={fi('powerUsage.value')} placeholder="0" />
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>kWh per month (metered consumption basis)</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Solar power capacity</label>
            <input className="form-input" type="number" min="0" value={form.solarPower} onChange={fi('solarPower')} placeholder="0" />
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Installed capacity (kW)</span>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title">Environment & CSR</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 24px', marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem' }}>
              <input type="checkbox" checked={form.effluentTreatment} onChange={fi('effluentTreatment')} style={{ accentColor: 'var(--accent)', width: 16, height: 16 }} />
              Effluent treatment plant (ETP)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem' }}>
              <input type="checkbox" checked={form.sewageTreatmentPlant} onChange={fi('sewageTreatmentPlant')} style={{ accentColor: 'var(--accent)', width: 16, height: 16 }} />
              STP available (sewage treatment)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem' }}>
              <input type="checkbox" checked={form.wasteManagementInPlace} onChange={fi('wasteManagementInPlace')} style={{ accentColor: 'var(--accent)', width: 16, height: 16 }} />
              Waste management system in place
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem' }}>
              <input type="checkbox" checked={form.rainwaterHarvesting} onChange={fi('rainwaterHarvesting')} style={{ accentColor: 'var(--accent)', width: 16, height: 16 }} />
              Rainwater harvesting
            </label>
          </div>
          <div className="form-group">
            <label className="form-label">Total CSR amount (₹ Lakhs)</label>
            <input className="form-input" type="number" step="0.01" min="0" value={form.csrTotal} onChange={fi('csrTotal')} placeholder="0" />
            <span style={{ display: 'block', marginTop: 6, fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 300 }}>
              Optional — if you report activity-wise breakdown, add items below.
            </span>
          </div>

          <div className="card" style={{ marginTop: 14, marginBottom: 0, background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div className="section-title" style={{ marginBottom: 0 }}>CSR activities (optional)</div>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addCsrActivity}>
                + Add activity
              </button>
            </div>

            {(!form.csrActivities || form.csrActivities.length === 0) ? (
              <p style={{ marginTop: 12, marginBottom: 0, fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                No activity items added. You can submit CSR total only.
              </p>
            ) : (
              <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
                {form.csrActivities.map((a, idx) => (
                  <div key={`csr-${idx}`} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text)' }}>Activity {idx + 1}</div>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeCsrActivity(idx)}>
                        Remove
                      </button>
                    </div>

                    <div className="form-row" style={{ marginTop: 10 }}>
                      <div className="form-group">
                        <label className="form-label">Activity</label>
                        <input
                          className="form-input"
                          value={a?.activity || ''}
                          onChange={(e) => updateCsrActivity(idx, 'activity', e.target.value)}
                          placeholder="e.g. Community health camp"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Amount (₹ Lakhs)</label>
                        <input
                          className="form-input"
                          type="number"
                          step="0.01"
                          min="0"
                          value={a?.amount ?? ''}
                          onChange={(e) => updateCsrActivity(idx, 'amount', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Beneficiaries</label>
                        <input
                          className="form-input"
                          type="number"
                          step="1"
                          min="0"
                          value={a?.beneficiaries ?? ''}
                          onChange={(e) => updateCsrActivity(idx, 'beneficiaries', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-textarea"
                        value={a?.description || ''}
                        onChange={(e) => updateCsrActivity(idx, 'description', e.target.value)}
                        placeholder="Short note (optional)…"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 16 }}>
          After submission, your return is marked <strong style={{ color: 'var(--text)' }}>Submitted</strong> and reviewed by SIPCOT admin. Track status under{' '}
          <Link to="/data/my">My Submissions</Link> (Approved / Under Review / Rejected with remarks).
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading || !hasIndustry || !!editBlocked || (!editId && (isPeriodTaken || allPeriodsTakenForYear))}
          >
            {loading ? 'Submitting…' : editId ? 'Save & resubmit' : 'Submit Data'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/data/my')} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
