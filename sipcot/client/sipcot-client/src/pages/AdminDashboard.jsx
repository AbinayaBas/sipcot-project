import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, exportExcel } from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';

const COLORS = ['#63b3ed','#4fd1c5','#f6ad55','#fc8181','#68d391','#b794f4','#f687b3'];

const ALERT_SORT = {
  'pending-submitted': 0,
  'park-bottleneck': 1,
  'top-flagged': 2,
  'overdue-pending': 3,
  'under-review': 4,
};

function sortAlertsForDisplay(alerts) {
  return [...(alerts || [])].sort(
    (a, b) => (ALERT_SORT[a.id] ?? 99) - (ALERT_SORT[b.id] ?? 99)
  );
}

function StatCard({ label, value, sub, color, onClick, hint, ctaText = 'View Details' }) {
  const clickable = typeof onClick === 'function';
  return (
    <div
      className={`stat-card${clickable ? ' stat-card-clickable' : ''}`}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      title={hint || (clickable ? `Open ${label}` : undefined)}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={clickable ? { cursor: 'pointer' } : undefined}
    >
      <div className="stat-value" style={{ color: color || 'var(--accent)' }}>{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
      {clickable && (
        <div style={{ fontSize: '0.7rem', color: 'var(--accent)', marginTop: 10, opacity: 0.9 }}>{ctaText}</div>
      )}
    </div>
  );
}

const POLL_MS = 15000;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const alertsSorted = useMemo(
    () => sortAlertsForDisplay(data?.decisionSupport?.alerts),
    [data?.decisionSupport?.alerts]
  );

  const handleConsolidatedDownload = useCallback(async () => {
    setExportLoading(true);
    try {
      const res = await exportExcel();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SIPCOT_Consolidated_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      navigate('/admin/export');
    } finally {
      setExportLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;

    const fetchStats = (isInitial) => {
      if (!isInitial) setRefreshing(true);
      getDashboardStats()
        .then((res) => {
          if (!cancelled) {
            setData(res.data);
            setLastUpdated(new Date());
          }
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
            setRefreshing(false);
          }
        });
    };

    fetchStats(true);
    const timer = setInterval(() => fetchStats(false), POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!data) return null;

  const { stats, aggregates, industryByType, yearlyTrend, monthlyData, decisionSupport, recentActivity } = data;

  const newAlertsCount = decisionSupport?.alerts?.length ?? 0;
  const pendingReviewsCount = stats.pendingRecords ?? 0;
  const submittedQueue = stats.submittedOnly ?? 0;
  const inspectionsToday = stats.inspectionsToday ?? 0;

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const chartMonthly = (monthlyData || []).map((d) => ({ name: monthNames[d._id.month - 1], submissions: d.count }));
  const chartTrend = (yearlyTrend || []).map((d) => ({ year: d._id, investment: d.investment, employment: d.employment }));

  return (
    <div className="fade-in">
      <div className="admin-about-strip">
        <div className="admin-about-strip-text">
          <span className="admin-about-strip-badge">SIPCOT</span>
          <strong className="admin-about-strip-headline">Industrial Monitoring &amp; Decision Support System</strong>
          <span className="admin-about-strip-muted">
            This administrative dashboard provides a centralized platform for monitoring industrial data across State Industries Promotion Corporation of Tamil Nadu Industrial Parks.
            It enables real-time tracking of submissions, verification processes, and data-driven decision-making for effective industrial governance.
          </span>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/admin/about-sipcot')}>
          Full guide
        </button>
      </div>

      <section className="admin-notify-banner" aria-label="Operational alerts">
        <div className="admin-notify-banner__item">
          <span className="admin-notify-banner__icon" aria-hidden>
            📥
          </span>
          <span>
            <strong>{submittedQueue}</strong> submission{submittedQueue === 1 ? '' : 's'} in <strong>Submitted</strong> status awaiting review.
            {pendingReviewsCount > 0 ? (
              <>
                {' '}
                (<strong>{pendingReviewsCount}</strong> total including Under Review.)
              </>
            ) : null}
          </span>
          <button type="button" className="btn btn-sm btn-secondary" onClick={() => navigate('/admin/records?status=Submitted')}>
            Review queue
          </button>
        </div>
        <div className="admin-notify-banner__item">
          <span className="admin-notify-banner__icon" aria-hidden>
            📅
          </span>
          <span>
            <strong>{inspectionsToday}</strong> schedule item{inspectionsToday === 1 ? '' : 's'} dated <strong>today</strong>.
          </span>
          <button type="button" className="btn btn-sm btn-secondary" onClick={() => navigate('/admin/schedule')}>
            Open schedule
          </button>
        </div>
      </section>

      <div className="page-header admin-dashboard-page-header">
        <div className="admin-dashboard-page-header-main">
          <h1>Admin Dashboard</h1>
          <p>
            This panel presents a comprehensive overview of industry submissions, system activity, and key performance indicators including investment, employment, and resource utilization.
            The dashboard supports efficient review and administrative control.
          </p>
          <div className="admin-dashboard-overview-card">
            <h2 className="admin-dashboard-overview-title">Key Administrative Functions</h2>
            <ul className="admin-dashboard-overview-list">
              <li>Review and verify industry data submissions</li>
              <li>Monitor investment and employment statistics</li>
              <li>Track resource utilization across industrial parks</li>
              <li>Identify high-risk or incomplete submissions</li>
              <li>Generate reports for analysis and decision-making</li>
            </ul>
            <p className="admin-dashboard-overview-foot">
              This module ensures structured data management and supports informed, data-driven administrative decisions.
            </p>
          </div>
        </div>
        <aside className="admin-dashboard-header-aside" aria-label="Monitoring snapshot">
          <div className="admin-dashboard-header-panel">
            <div className="admin-dashboard-panel-kicker">Monitoring snapshot</div>
            <div className="admin-dashboard-notify-grid" role="status">
              <div className="admin-dashboard-notify-tile">
                <span className="admin-dashboard-notify-label">Pending Reviews</span>
                <span className="admin-dashboard-notify-val">{pendingReviewsCount}</span>
              </div>
              <div className="admin-dashboard-notify-tile">
                <span className="admin-dashboard-notify-label">New Alerts</span>
                <span className="admin-dashboard-notify-val">{newAlertsCount}</span>
              </div>
            </div>
            <div className="admin-dashboard-status-legend" aria-label="Status legend">
              <span><span className="admin-legend-dot admin-legend-dot--approved" aria-hidden /> Approved</span>
              <span><span className="admin-legend-dot admin-legend-dot--pending" aria-hidden /> Pending</span>
              <span><span className="admin-legend-dot admin-legend-dot--risk" aria-hidden /> High risk</span>
            </div>
            <button
              type="button"
              className="btn btn-primary admin-dashboard-download-btn"
              onClick={handleConsolidatedDownload}
              disabled={exportLoading}
              title="Downloads consolidated approved data as Excel. Open in Excel or export to PDF if needed."
            >
              {exportLoading ? 'Preparing…' : 'Download Report'}
            </button>
            <div className="admin-dashboard-live-row">
              <span className="admin-dashboard-live-dot">●</span>
              <span className="admin-dashboard-live-label">Live</span>
              {refreshing && <span className="admin-dashboard-live-refresh">Updating…</span>}
              {lastUpdated && (
                <span className="admin-dashboard-live-time">
                  Generated at{' '}
                  {lastUpdated.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  <span className="admin-dashboard-live-poll"> · refresh every {POLL_MS / 1000}s</span>
                </span>
              )}
            </div>
          </div>
        </aside>
      </div>

      {recentActivity?.length ? (
        <section className="card admin-dashboard-recent-strip" aria-label="Recent activity">
          <div className="admin-dashboard-recent-head">Recent activity</div>
          <ul className="admin-dashboard-recent-list">
            {recentActivity.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="admin-dashboard-recent-item"
                  onClick={() => navigate('/admin/records')}
                >
                  <span className="admin-dashboard-recent-msg">{item.message}</span>
                  {item.at && (
                    <time className="admin-dashboard-recent-time" dateTime={item.at}>
                      {new Date(item.at).toLocaleString()}
                    </time>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="admin-dashboard-kpi-grid">
        <StatCard
          label="Total Industries"
          value={stats.totalIndustries}
          color="var(--accent)"
          hint="Registered industrial units"
          onClick={() => navigate('/admin/industries')}
        />
        <StatCard
          label="Total Submissions"
          value={stats.totalRecords}
          color="var(--accent3)"
          hint="All MIS returns on file"
          onClick={() => navigate('/admin/records')}
        />
        <StatCard
          label="Pending Review"
          value={stats.pendingRecords}
          color="var(--danger)"
          hint="Submitted + Under Review"
          onClick={() => navigate('/admin/records?status=Submitted')}
        />
        <StatCard
          label="Approved"
          value={stats.approvedRecords ?? 0}
          color="var(--success)"
          hint="Finalized returns"
          onClick={() => navigate('/admin/records?status=Approved')}
        />
        <StatCard
          label="Industry Users"
          value={stats.totalUsers}
          color="var(--accent2)"
          hint="Industry-side accounts"
          onClick={() => navigate('/admin/users')}
        />
      </div>

      <p className="admin-dashboard-summary-caption">
        These indicators provide a quick summary of the current system status and data flow across all registered industries.
      </p>

      {decisionSupport && (
        <div className="grid-2" style={{ marginBottom: 28 }}>
          <div className="card">
            <div className="section-title">Decision Support — Alerts</div>
            {alertsSorted.length ? (
              <div style={{ display: 'grid', gap: 12 }}>
                {alertsSorted.slice(0, 8).map((a) => (
                  <div
                    key={a.id}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: 14,
                      background:
                        a.severity === 'danger'
                          ? 'rgba(252,129,129,0.08)'
                          : a.severity === 'warning'
                            ? 'rgba(246,173,85,0.08)'
                            : 'rgba(99,179,237,0.07)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ fontWeight: 700 }}>{a.title}</div>
                      <span className={`badge ${a.severity === 'danger' ? 'badge-danger' : a.severity === 'warning' ? 'badge-warning' : 'badge-info'}`}>
                        {a.severity}
                      </span>
                    </div>
                    <div style={{ marginTop: 6, fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      {a.message}
                    </div>
                    {a.action?.href && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ marginTop: 10 }}
                        onClick={() => navigate(a.action.href)}
                      >
                        {a.action.label || 'View Details'}
                      </button>
                    )}
                    {a.meta?.pendingByPark?.length ? (
                      <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {a.meta.pendingByPark.map((p) => (
                          <span key={p._id || 'unknown'} className="sipcot-info-pill">
                            {p._id || 'Unknown'} · {p.count}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 30 }}>
                <div className="empty-icon">✅</div>
                <p>No active alerts. Monitoring parameters are within expected ranges.</p>
              </div>
            )}
          </div>

          <div className="card">
            <div className="section-title">Decision Support — Recommendations</div>
            {decisionSupport.recommendations?.length ? (
              <div style={{ display: 'grid', gap: 12 }}>
                {decisionSupport.recommendations.slice(0, 5).map((r) => (
                  <div key={r.id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 14, background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ fontWeight: 800, fontFamily: 'var(--font-head)' }}>{r.title}</div>
                    <div style={{ marginTop: 6, fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      {r.rationale}
                    </div>
                    {r.action?.href && (
                      <button type="button" className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={() => navigate(r.action.href)}>
                        {r.action.label || 'View Details'}
                      </button>
                    )}
                  </div>
                ))}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.85 }}>
                  Generated at: {decisionSupport.generatedAt ? new Date(decisionSupport.generatedAt).toLocaleString() : '—'}
                </div>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 30 }}>
                <div className="empty-icon">📌</div>
                <p>No recommendations available.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {decisionSupport ? (
        <div className="card admin-dashboard-flagged-card" style={{ marginBottom: 28 }}>
          <div className="section-title">Top Flagged (Risk-Based) Submissions</div>
          <p className="admin-dashboard-flagged-intro">
            This section displays submissions identified as high priority based on risk evaluation parameters. It assists administrators in focusing on critical records requiring immediate attention.
          </p>
          {decisionSupport.signals?.topFlagged?.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Risk</th><th>Industry</th><th>Park</th><th>Type</th><th>Year</th><th>Quarter</th><th>Status</th><th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {decisionSupport.signals.topFlagged.map((r) => (
                    <tr key={r._id} style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/records')}>
                      <td><span className={`badge ${r.riskScore >= 60 ? 'badge-danger' : r.riskScore >= 40 ? 'badge-warning' : 'badge-info'}`}>{r.riskScore}</span></td>
                      <td style={{ fontWeight: 600 }}>{r.industry?.name || '—'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{r.industry?.sipcotPark || '—'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{r.industry?.type || '—'}</td>
                      <td style={{ fontWeight: 700 }}>{r.year}</td>
                      <td>{r.quarter}</td>
                      <td><span className={`badge ${r.status === 'Submitted' ? 'badge-warning' : 'badge-info'}`}>{r.status}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 24 }}>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No flagged submissions in the current priority queue. Risk scoring applies to submitted and under-review records when rule thresholds are met.
              </p>
            </div>
          )}
          <div style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Risk score is rule-based (water/power usage, missing compliance indicators, etc.) and used for decision-support prioritization.
          </div>
        </div>
      ) : null}

      {aggregates && (
        <div className="grid-3" style={{ marginBottom: 28 }}>
          <div
            className="card dashboard-drill-card"
            style={{ textAlign: 'center' }}
            role="button"
            tabIndex={0}
            title="Open data records to see employment per submission"
            onClick={() => navigate('/admin/records')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/admin/records');
              }
            }}
          >
            <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-head)', fontWeight: 800, color: 'var(--accent)' }}>
              {aggregates.totalEmployment?.toLocaleString() || 0}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>TOTAL EMPLOYMENT</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent)', marginTop: 10 }}>View Details</div>
          </div>
          <div
            className="card dashboard-drill-card"
            style={{ textAlign: 'center' }}
            role="button"
            tabIndex={0}
            title="Open data records to see investment figures"
            onClick={() => navigate('/admin/records')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/admin/records');
              }
            }}
          >
            <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-head)', fontWeight: 800, color: 'var(--accent2)' }}>
              ₹{((aggregates.totalInvestment || 0) / 100).toFixed(1)}Cr
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>TOTAL INVESTMENT</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent)', marginTop: 10 }}>View Details</div>
          </div>
          <div
            className="card dashboard-drill-card"
            style={{ textAlign: 'center' }}
            role="button"
            tabIndex={0}
            title="Open data records to see turnover figures"
            onClick={() => navigate('/admin/records')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/admin/records');
              }
            }}
          >
            <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-head)', fontWeight: 800, color: 'var(--accent3)' }}>
              ₹{((aggregates.totalTurnover || 0) / 100).toFixed(1)}Cr
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>TOTAL TURNOVER</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent)', marginTop: 10 }}>View Details</div>
          </div>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: 28 }}>
        <div className="chart-card">
          <h3>Monthly Submissions</h3>
          <p className="chart-card-desc">
            Displays the number of data submissions received over a period of time, helping identify reporting trends and peak activity periods.
          </p>
          {chartMonthly.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartMonthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#7a8ba8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#7a8ba8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0e1628', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8edf5' }} />
                <Bar dataKey="submissions" fill="#63b3ed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-state" style={{ padding: 40 }}><p>No data yet</p></div>}
        </div>

        <div className="chart-card">
          <h3>Industry by Type</h3>
          <p className="chart-card-desc">
            Represents the distribution of industries across various sectors within SIPCOT Industrial Parks.
          </p>
          {industryByType?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={industryByType} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {industryByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0e1628', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8edf5' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state" style={{ padding: 40 }}><p>No data yet</p></div>}
        </div>
      </div>

      {chartTrend.length > 0 && (
        <div className="chart-card">
          <h3>Year-wise Investment Trend</h3>
          <p className="chart-card-desc">
            Shows the variation in total industrial investment over the years, providing insights into growth patterns and economic development.
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="year" tick={{ fill: '#7a8ba8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#7a8ba8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0e1628', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8edf5' }} />
              <Line type="monotone" dataKey="investment" stroke="#63b3ed" strokeWidth={2} dot={{ fill: '#63b3ed', r: 4 }} name="Investment (Cr)" />
              <Line type="monotone" dataKey="employment" stroke="#4fd1c5" strokeWidth={2} dot={{ fill: '#4fd1c5', r: 4 }} name="Employment" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
