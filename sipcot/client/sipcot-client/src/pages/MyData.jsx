import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyData, deleteData } from '../utils/api';

/** Green / yellow (pending) / red for quick scan */
const StatusBadge = ({ s }) => {
  const map = {
    Approved: 'badge-success',
    Rejected: 'badge-danger',
    Submitted: 'badge-warning',
    'Under Review': 'badge-warning',
    Draft: 'badge-muted',
  };
  return <span className={`badge ${map[s] || 'badge-muted'}`}>{s}</span>;
};

function fmtLakhs(r) {
  const v = r?.investment?.value;
  if (v == null || v === '') return '—';
  return `₹${Number(v).toLocaleString('en-IN')} ${r.investment?.unit || 'Lakhs INR'}`;
}

function fmtTurn(r) {
  const v = r?.turnover?.value;
  if (v == null || v === '') return '—';
  return `₹${Number(v).toLocaleString('en-IN')} ${r.turnover?.unit || 'Lakhs INR'}`;
}

function truncateRemark(s, n = 56) {
  const t = String(s || '').trim();
  if (!t) return '—';
  return t.length <= n ? t : `${t.slice(0, n)}…`;
}

export default function MyData() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMyData().then((res) => setRecords(res.data.data || [])).finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c = { Approved: 0, Rejected: 0, Submitted: 0, 'Under Review': 0, Draft: 0, other: 0 };
    records.forEach((r) => {
      if (c[r.status] !== undefined) c[r.status] += 1;
      else c.other += 1;
    });
    return c;
  }, [records]);

  const pendingTotal = counts.Submitted + counts['Under Review'];

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    await deleteData(id);
    setRecords((prev) => prev.filter((r) => r._id !== id));
  };

  const goNewSubmission = () => {
    const msg =
      'Each reporting year and quarter (or Annual) can only be filed once. If you already submitted for a period, open that row and use Edit & Resubmit instead of creating a duplicate. Continue to the new submission form?';
    if (records.length > 0 && !window.confirm(msg)) return;
    navigate('/data/submit');
  };

  const canEdit = (r) => r.status !== 'Approved';

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="fade-in portal-page">
      <header className="portal-hero portal-hero--split">
        <div>
          <div className="portal-hero__eyebrow">Statutory MIS returns</div>
          <h1>My Submissions</h1>
          <p className="portal-hero__lead">
            Your submission journey from filing through SIPCOT review — same record, visible status, and clear next steps when something needs correction.
          </p>
          <div className="portal-hero__chips" style={{ marginTop: 14 }}>
            <span className="portal-chip">One row per period</span>
            <span className="portal-chip">Admin remarks on reject</span>
            <span className="portal-chip">Edit & resubmit loop</span>
          </div>
        </div>
        <button className="btn btn-primary portal-hero__cta" type="button" onClick={goNewSubmission}>
          + New submission
        </button>
      </header>

      {records.length > 0 && (
        <div className="submissions-kpi-row">
          <div className="submissions-kpi submissions-kpi--total">
            <span className="submissions-kpi__label">Total on file</span>
            <span className="submissions-kpi__value">{records.length}</span>
          </div>
          <div className="submissions-kpi submissions-kpi--approved">
            <span className="submissions-kpi__label">Approved</span>
            <span className="submissions-kpi__value">{counts.Approved}</span>
          </div>
          <div className="submissions-kpi submissions-kpi--pending">
            <span className="submissions-kpi__label">Pending review</span>
            <span className="submissions-kpi__value">{pendingTotal}</span>
          </div>
          <div className="submissions-kpi submissions-kpi--rejected">
            <span className="submissions-kpi__label">Rejected</span>
            <span className="submissions-kpi__value">{counts.Rejected}</span>
          </div>
        </div>
      )}

      {records.length > 0 && (
        <div className="portal-guidance-panel">
          <p>
            <strong style={{ color: 'var(--text)' }}>Track your filings.</strong> Approved entries are finalized for the estate register.
            Submitted and Under Review mean your return is still in the workflow.
            Rejected rows carry <strong style={{ color: 'var(--text)' }}>admin remarks</strong> — open the row, fix figures, then <strong>Edit & Resubmit</strong>.
          </p>
          <div className="portal-guidance-legend">
            <span><span className="badge badge-success">Approved</span> finalized</span>
            <span><span className="badge badge-warning">Submitted / Under Review</span> pending</span>
            <span><span className="badge badge-danger">Rejected</span> needs correction</span>
          </div>
        </div>
      )}

      {records.length === 0 ? (
        <div className="card portal-empty-rich">
          <div className="portal-empty-rich__icon">📋</div>
          <h3>No statutory returns yet</h3>
          <p>
            When you file from Submit Data, each year and quarter appears here with live status — Approved, pending, or rejected with remarks.
          </p>
          <button type="button" className="btn btn-primary" style={{ marginTop: 18 }} onClick={goNewSubmission}>
            Start first submission
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden', border: 'none', background: 'transparent', boxShadow: 'none' }}>
          <div className="table-portal-wrap">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Investment</th>
                    <th>Employment</th>
                    <th>Turnover</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <div style={{ fontWeight: 700, fontFamily: 'var(--font-head)' }}>{r.year}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{r.quarter}</div>
                      </td>
                      <td style={{ fontSize: '0.86rem', whiteSpace: 'nowrap' }}>{fmtLakhs(r)}</td>
                      <td style={{ fontWeight: 600 }}>{r.employment?.total ?? '—'}</td>
                      <td style={{ fontSize: '0.86rem', whiteSpace: 'nowrap' }}>{fmtTurn(r)}</td>
                      <td>
                        <StatusBadge s={r.status} />
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: 200 }} title={r.adminRemarks || undefined}>
                        {truncateRemark(r.adminRemarks)}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" type="button" onClick={() => setSelected(r)}>
                            View
                          </button>
                          {canEdit(r) && (
                            <button
                              className="btn btn-primary btn-sm"
                              type="button"
                              onClick={() => navigate(`/data/submit?edit=${r._id}`)}
                            >
                              Edit
                            </button>
                          )}
                          {r.status !== 'Approved' && (
                            <button className="btn btn-danger btn-sm" type="button" onClick={() => handleDelete(r._id)}>
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="modal-overlay" role="presentation" onClick={() => setSelected(null)}>
          <div className="modal modal-portal-detail" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Return snapshot</h3>
                <p style={{ margin: '8px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                  Read-only · {selected.year} · {selected.quarter}
                </p>
              </div>
              <button type="button" className="modal-close" aria-label="Close" onClick={() => setSelected(null)}>
                ×
              </button>
            </div>

            <div className="modal-portal-detail__body">
              <div className="detail-block">
                <div className="detail-block-title">Workflow</div>
                {[
                  ['Status', <StatusBadge key="s" s={selected.status} />],
                  ['Submitted', selected.submittedAt ? new Date(selected.submittedAt).toLocaleString('en-IN') : '—'],
                  ['Last reviewed', selected.reviewedAt ? new Date(selected.reviewedAt).toLocaleString('en-IN') : '—'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: '0.88rem', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontWeight: 500 }}>{v || '—'}</span>
                  </div>
                ))}
                {selected.adminRemarks ? (
                  <div style={{ marginTop: 12, padding: 14, background: 'rgba(252,129,129,0.08)', border: '1px solid rgba(252,129,129,0.22)', borderRadius: 10 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--danger)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Admin remarks
                    </div>
                    <div style={{ fontSize: '0.88rem', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{selected.adminRemarks}</div>
                  </div>
                ) : (
                  <p style={{ margin: '10px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>No remarks on file.</p>
                )}
              </div>

              <div className="detail-block">
                <div className="detail-block-title">Financial</div>
                {[
                  ['Investment', fmtLakhs(selected)],
                  ['Turnover', fmtTurn(selected)],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>

              <div className="detail-block">
                <div className="detail-block-title">Employment</div>
                {[
                  ['Total', selected.employment?.total],
                  ['Male / Female', `${selected.employment?.male ?? '—'} / ${selected.employment?.female ?? '—'}`],
                  ['Skilled / Unskilled', `${selected.employment?.skilled ?? '—'} / ${selected.employment?.unskilled ?? '—'}`],
                  ['Local', selected.employment?.local],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontWeight: 500 }}>{v ?? '—'}</span>
                  </div>
                ))}
              </div>

              <div className="detail-block">
                <div className="detail-block-title">Resources</div>
                {[
                  ['Water', `${selected.waterUsage?.value ?? '—'} ${selected.waterUsage?.unit || 'KLD'}`],
                  ['Power', `${selected.powerUsage?.value ?? '—'} ${selected.powerUsage?.unit || 'kWh/month'}`],
                  ['Solar', `${selected.solarPower ?? '—'} kW`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>

              <div className="detail-block">
                <div className="detail-block-title">Environment & CSR</div>
                {[
                  ['ETP', selected.effluentTreatment ? 'Yes' : 'No'],
                  ['STP', selected.sewageTreatmentPlant ? 'Yes' : 'No'],
                  ['Waste management', selected.wasteManagementInPlace ? 'Yes' : 'No'],
                  ['Rainwater', selected.rainwaterHarvesting ? 'Yes' : 'No'],
                  ['CSR total (₹ Lakhs)', selected.csrTotal ?? '—'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
                {Array.isArray(selected.csrActivities) && selected.csrActivities.length > 0 ? (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>CSR line items</div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.86rem', lineHeight: 1.55 }}>
                      {selected.csrActivities.map((a, i) => (
                        <li key={i}>
                          {a.activity || 'Activity'}
                          {a.amount != null ? ` · ₹${a.amount} Lakhs` : ''}
                          {a.beneficiaries != null ? ` · ${a.beneficiaries} beneficiaries` : ''}
                          {a.description ? ` — ${a.description}` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="modal-portal-detail__footer">
              {canEdit(selected) && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setSelected(null);
                    navigate(`/data/submit?edit=${selected._id}`);
                  }}
                >
                  Edit & Resubmit
                </button>
              )}
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
