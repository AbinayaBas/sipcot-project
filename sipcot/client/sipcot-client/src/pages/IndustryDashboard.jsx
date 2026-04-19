import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { downloadMyDocumentUrl, getMyAnnouncements, getMyDocuments, getMyIndustry, getMyData, getMySchedule } from '../utils/api';
import { displayScheduleType, scheduleTypeBadgeClass } from '../utils/scheduleDisplay';
import { displayDocumentCategory } from '../utils/documentDisplay';

const StatusBadge = ({ status }) => {
  const map = { Approved: 'badge-success', Rejected: 'badge-danger', Submitted: 'badge-warning', 'Under Review': 'badge-info', Draft: 'badge-muted' };
  return <span className={`badge ${map[status] || 'badge-muted'}`}>{status}</span>;
};

function formatInvestmentDisplay(r) {
  const v = r.investment?.value;
  if (v == null || Number.isNaN(Number(v))) return '—';
  const unit = (r.investment?.unit || 'Lakhs INR').toLowerCase();
  if (unit.includes('lakh')) {
    const cr = Number(v) / 100;
    const formatted = Number.isInteger(cr) ? String(cr) : cr.toFixed(2).replace(/\.?0+$/, '');
    return `₹${formatted} Cr`;
  }
  return `₹${v} ${r.investment?.unit || ''}`.trim();
}

function formatRemarks(r) {
  const s = String(r.adminRemarks || '').trim();
  if (!s) return '—';
  return s.length > 90 ? `${s.slice(0, 90)}…` : s;
}

export default function IndustryDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [industry, setIndustry] = useState(null);
  const [records, setRecords] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyIndustry(), getMyData(), getMyAnnouncements({ limit: 1 }), getMySchedule({ limit: 1 }), getMyDocuments({ limit: 1 })])
      .then(([iRes, dRes, aRes, sRes, docRes]) => {
        setIndustry(iRes.data.data);
        setRecords(dRes.data.data || []);
        setAnnouncements(aRes.data.data || []);
        setSchedule(sRes.data.data || []);
        setDocuments(docRes.data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const reportYear = records.length ? Math.max(...records.map((r) => r.year)) : new Date().getFullYear();
  const recordsY = records.filter((r) => r.year === reportYear);
  const approvedY = recordsY.filter((r) => r.status === 'Approved').length;
  const pendingY = recordsY.filter((r) => r.status === 'Submitted' || r.status === 'Under Review').length;
  const rejectedY = recordsY.filter((r) => r.status === 'Rejected').length;

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const deadlineYear = new Date().getFullYear();
  const deadlineLabel = `31 Mar ${deadlineYear}`;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Welcome, {user?.name?.split(' ')[0]}</h1>
        <p>Manage your industry data and track submission status</p>
      </div>

      {/* Reporting window strip removed per UI request */}

      {!industry && (
        <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>⚠️ You haven't registered your industry yet.</span>
          <button className="btn btn-sm btn-primary" onClick={() => navigate('/industry')}>Register Industry</button>
        </div>
      )}

      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Submissions', value: recordsY.length, color: 'var(--accent)', bg: 'rgba(99,179,237,0.1)' },
          { label: 'Approved', value: approvedY, color: 'var(--success)', bg: 'rgba(104,211,145,0.1)' },
          { label: 'Pending Review', value: pendingY, color: 'var(--warning)', bg: 'rgba(246,173,85,0.1)' },
          { label: 'Rejected', value: rejectedY, color: 'var(--danger)', bg: 'rgba(252,129,129,0.1)' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><span style={{ fontSize: '1.2rem' }}>{s.label[0]}</span></div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.9, marginTop: 8, letterSpacing: '0.02em' }}>
              Reporting year {reportYear}
            </div>
          </div>
        ))}
      </div>

      {industry && (
        <div className="grid-3" style={{ marginBottom: 28 }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
              <div style={{ flex: '1 1 160px' }}>
                <div className="section-title" style={{ marginBottom: 4 }}>Announcements</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  Latest item preview — full list in Updates Center.
                </div>
              </div>
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => navigate({ pathname: '/updates', hash: 'announcements' })}>
                View all →
              </button>
            </div>
            {announcements.length === 0 ? (
              <div className="empty-state" style={{ padding: '18px 12px 22px' }}>
                <div className="empty-icon">📣</div>
                <p style={{ marginBottom: 8 }}>No recent announcements in this preview.</p>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
                  Circulars may still appear in Updates Center — open it to see the complete list for your park or sector.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {announcements.map((a) => (
                  <div key={a._id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                      <div style={{ fontWeight: 800 }}>{a.title}</div>
                      <span className={`badge ${a.priority === 'high' ? 'badge-danger' : a.priority === 'low' ? 'badge-muted' : 'badge-info'}`}>{a.priority}</span>
                    </div>
                    <div style={{ marginTop: 6, fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      {String(a.message || '').slice(0, 180)}{String(a.message || '').length > 180 ? '…' : ''}
                    </div>
                    <div style={{ marginTop: 10, fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.85 }}>
                      {a.createdAt ? new Date(a.createdAt).toLocaleString() : '—'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
              <div style={{ flex: '1 1 160px' }}>
                <div className="section-title" style={{ marginBottom: 4 }}>Schedule (next upcoming)</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  Next slot only — past and future items are in Updates Center.
                </div>
              </div>
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => navigate({ pathname: '/updates', hash: 'schedule' })}>
                View all →
              </button>
            </div>
            {schedule.length === 0 ? (
              <div className="empty-state" style={{ padding: '18px 12px 22px' }}>
                <div className="empty-icon">📅</div>
                <p style={{ marginBottom: 8 }}>No upcoming schedule in this preview.</p>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
                  Inspections and deadlines may be listed under Updates Center — including events that already passed.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {schedule.map((i) => (
                  <div key={i._id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 800 }}>{i.title}</div>
                      <span className={`badge ${scheduleTypeBadgeClass(i.type)}`}>{displayScheduleType(i.type)}</span>
                    </div>
                    <div style={{ marginTop: 6, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {i.date ? new Date(i.date).toLocaleString() : '—'}
                      {i.location ? ` · ${i.location}` : ''}
                    </div>
                    {i.description ? (
                      <div style={{ marginTop: 6, fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        {String(i.description).slice(0, 150)}{String(i.description).length > 150 ? '…' : ''}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
              <div style={{ flex: '1 1 160px' }}>
                <div className="section-title" style={{ marginBottom: 4 }}>Documents</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  Most recent upload — browse all files in Updates Center.
                </div>
              </div>
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => navigate({ pathname: '/updates', hash: 'documents' })}>
                View all →
              </button>
            </div>
            {documents.length === 0 ? (
              <div className="empty-state" style={{ padding: '18px 12px 22px' }}>
                <div className="empty-icon">📄</div>
                <p style={{ marginBottom: 8 }}>No documents in this preview.</p>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
                  Guidelines and templates are published in Updates Center — open Documents to download.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {documents.map((d) => (
                  <div key={d._id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 800 }}>{d.title}</div>
                      <span className="badge badge-info">{displayDocumentCategory(d.category)}</span>
                    </div>
                    {d.versionYear ? (
                      <div style={{ marginTop: 6, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {d.versionYear}
                      </div>
                    ) : null}
                    {d.description ? (
                      <div style={{ marginTop: 6, fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        {String(d.description).slice(0, 140)}{String(d.description).length > 140 ? '…' : ''}
                      </div>
                    ) : null}
                    <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {Number(d.downloadCount) || 0} downloads
                      </span>
                      <a className="btn btn-secondary btn-sm" href={downloadMyDocumentUrl(d._id)} target="_blank" rel="noreferrer">Download</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {industry && (
        <div className="grid-3" style={{ marginBottom: 28 }}>
          <div className="card">
            <div className="section-title">My Industry</div>
            <div style={{ display: 'grid', gap: 10 }}>
              <Row label="Name" value={industry.name} />
              <Row label="Type" value={industry.type} />
              <Row label="SIPCOT Park" value={industry.sipcotPark} />
              <Row label="Status" value={<StatusBadge status={industry.status} />} />
              <Row label="Category" value={industry.category} />
              <Row
                label="Last updated"
                value={industry.updatedAt ? new Date(industry.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
              />
            </div>
            <button className="btn btn-secondary btn-sm" style={{ marginTop: 16 }} onClick={() => navigate('/industry')}>Edit Details</button>
          </div>
          <div className="card">
            <div className="section-title">Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button className="btn btn-primary" onClick={() => navigate('/data/submit')}>
                <span>+</span> Submit New Return
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/data/my')}>View All Submissions</button>
              <button className="btn btn-secondary" onClick={() => navigate('/profile')}>Update Profile</button>
            </div>
          </div>
          <div className="card">
            <div className="section-title">What to do next</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
              <li style={{ marginBottom: 8 }}>Submit statutory returns before the published deadline (see Announcements).</li>
              <li style={{ marginBottom: 8 }}>Update My Industry if plot, contact, or operational details changed.</li>
              <li>Review Announcements and Schedule regularly for notices and inspections.</li>
            </ul>
          </div>
        </div>
      )}

      <div className="card">
        <div className="section-title">Recent Submissions</div>
        {records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No data submissions yet. Submit your first report!</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Year</th><th>Quarter</th><th>Investment</th><th>Employment</th><th>Status</th><th>Remarks</th><th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {records.slice(0, 8).map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 600 }}>{r.year}</td>
                    <td>{r.quarter}</td>
                    <td>{formatInvestmentDisplay(r)}</td>
                    <td>{r.employment?.total ?? '—'}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem', maxWidth: 220 }} title={r.adminRemarks || ''}>{formatRemarks(r)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value || '—'}</span>
    </div>
  );
}
