import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllRecords, reviewRecord } from '../utils/api';

const PARKS = [
  'Hosur I',
  'Hosur II',
  'Perundurai',
  'Oragadam',
  'Sriperumbudur',
  'Ranipet',
  'Gummidipoondi',
  'Irrungattukottai',
  'Cuddalore',
  'Tuticorin',
  'Other',
];

const STATUS_OPTIONS = ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected'];

const StatusBadge = ({ s }) => {
  const map = {
    Approved: 'badge-success',
    Rejected: 'badge-danger',
    Submitted: 'badge-warning',
    'Under Review': 'badge-info',
    Draft: 'badge-muted',
  };
  return <span className={`badge ${map[s] || 'badge-muted'}`}>{s}</span>;
};

function truncateRemarks(text, len = 44) {
  if (!text || !String(text).trim()) return null;
  const t = String(text).trim();
  return t.length > len ? `${t.slice(0, len)}…` : t;
}

function formatInvestment(r) {
  const v = r.investment?.value;
  if (v == null || v === '') return '—';
  const u = r.investment?.unit ? ` ${r.investment.unit}` : '';
  return `₹${v}${u}`;
}

function formatLastUpdated(r) {
  const d = r.updatedAt || r.reviewedAt || r.submittedAt;
  return d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
}

export default function AdminRecords() {
  const [searchParams] = useSearchParams();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', year: '', park: '', search: '' });
  const [sortBy, setSortBy] = useState('recent');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [reviewing, setReviewing] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  const fetchRecords = (p = page) => {
    setLoading(true);
    const { search, ...rest } = filter;
    getAllRecords({
      ...rest,
      park: filter.park || undefined,
      ...(search?.trim() ? { q: search.trim() } : {}),
      sortBy,
      page: p,
      limit: 20,
    })
      .then((res) => {
        setRecords(res.data.data || []);
        setPages(res.data.pages || 1);
        setTotal(res.data.total ?? 0);
        setStats(res.data.stats || null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const s = searchParams.get('status');
    const y = searchParams.get('year');
    setFilter((f) => ({
      ...f,
      ...(s !== null && s !== undefined ? { status: s || '' } : {}),
      ...(y !== null && y !== undefined && y !== '' ? { year: y } : {}),
    }));
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    fetchRecords(page);
  }, [filter, sortBy, page]);

  const handleReview = async (nextStatus) => {
    setSaving(true);
    try {
      await reviewRecord(reviewing._id, { status: nextStatus, adminRemarks: remarks });
      const notice =
        nextStatus === 'Approved'
          ? 'Record approved successfully.'
          : nextStatus === 'Rejected'
            ? 'Record rejected. Remarks are visible to the industry user.'
            : 'Record marked as under review.';
      setActionNotice({ type: 'success', text: notice });
      window.setTimeout(() => setActionNotice(null), 6500);
      fetchRecords(page);
      setReviewing(null);
      setRemarks('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const openReview = (r) => {
    setReviewing(r);
    setRemarks(r.adminRemarks || '');
  };

  const showingFiltered = filter.status || filter.year || filter.park || filter.search?.trim();

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Data Records</h1>
        <p style={{ maxWidth: 720 }}>
          Displays all industry data submissions. Administrators can review, validate, and approve records to ensure
          accuracy before inclusion in reports.
        </p>
        <p style={{ marginTop: 10, fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 300 }}>
          Showing <strong style={{ color: 'var(--text)' }}>{total}</strong> record{total === 1 ? '' : 's'}{' '}
          {showingFiltered ? 'matching the filters below' : 'in total for this page view'}.
        </p>
      </div>

      {actionNotice ? (
        <div className={`alert alert-${actionNotice.type}`} role="status">
          {actionNotice.text}
        </div>
      ) : null}

      <div className="filters" style={{ flexWrap: 'wrap', gap: 10 }}>
        <input
          type="search"
          className="search-input"
          placeholder="Search industry name, type, or park…"
          value={filter.search}
          onChange={(e) => {
            setFilter({ ...filter, search: e.target.value });
            setPage(1);
          }}
          aria-label="Search records by industry"
          style={{ minWidth: 200, flex: '1 1 200px' }}
        />
        <select
          className="filter-select"
          value={filter.status}
          onChange={(e) => {
            setFilter({ ...filter, status: e.target.value });
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="filter-select"
          value={filter.year}
          onChange={(e) => {
            setFilter({ ...filter, year: e.target.value });
            setPage(1);
          }}
        >
          <option value="">All Years</option>
          {Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          className="filter-select"
          value={filter.park}
          onChange={(e) => {
            setFilter({ ...filter, park: e.target.value });
            setPage(1);
          }}
          aria-label="Filter by SIPCOT park"
        >
          <option value="">All Parks</option>
          {PARKS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          aria-label="Sort records"
        >
          <option value="recent">Sort: Recent</option>
          <option value="investment">Sort: Investment (high → low)</option>
          <option value="employment">Sort: Employment (high → low)</option>
        </select>
      </div>

      <p
        style={{
          margin: '12px 0 0',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          maxWidth: 960,
          lineHeight: 1.55,
        }}
      >
        Approved records are included in analytics and export reports. Use remarks to document verification outcomes—
        industry users can read them on their submission view.
      </p>

      {stats ? (
        <div
          className="card"
          style={{
            marginTop: 14,
            padding: '14px 18px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '14px 28px',
            alignItems: 'center',
            fontSize: '0.88rem',
          }}
        >
          <span>
            <strong style={{ color: 'var(--text)' }}>Total records:</strong>{' '}
            <span style={{ color: 'var(--text-muted)' }}>{stats.total}</span>
          </span>
          <span>
            <strong style={{ color: 'var(--text)' }}>Pending review:</strong>{' '}
            <span style={{ color: 'var(--warning)' }}>{stats.pending}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginLeft: 6 }}>
              (Submitted + Under Review)
            </span>
          </span>
          <span>
            <strong style={{ color: 'var(--text)' }}>Approved:</strong>{' '}
            <span style={{ color: 'var(--success)' }}>{stats.approved}</span>
          </span>
          <span>
            <strong style={{ color: 'var(--text)' }}>Rejected:</strong>{' '}
            <span style={{ color: 'var(--text-muted)' }}>{stats.rejected}</span>
          </span>
        </div>
      ) : null}

      <div className="card" style={{ marginTop: 16 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No records found.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Industry</th>
                  <th>Type</th>
                  <th>Park</th>
                  <th>Year</th>
                  <th>Quarter</th>
                  <th>Investment</th>
                  <th>Employment</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th>Last updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 500 }}>{r.industry?.name || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{r.industry?.type}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{r.industry?.sipcotPark}</td>
                    <td style={{ fontWeight: 600 }}>{r.year}</td>
                    <td>{r.quarter}</td>
                    <td style={{ fontSize: '0.82rem' }}>{formatInvestment(r)}</td>
                    <td>{r.employment?.total ?? '—'}</td>
                    <td>
                      <StatusBadge s={r.status} />
                    </td>
                    <td
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        maxWidth: 160,
                      }}
                      title={r.adminRemarks || ''}
                    >
                      {truncateRemarks(r.adminRemarks) || (
                        <span style={{ opacity: 0.65 }}>—</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.76rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatLastUpdated(r)}
                    </td>
                    <td>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => openReview(r)}>
                        Review Record
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="pagination">
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
              ←
            </button>
            {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map((p) => (
              <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>
                {p}
              </button>
            ))}
            <button className="page-btn" disabled={page === pages} onClick={() => setPage(page + 1)}>
              →
            </button>
          </div>
        )}
      </div>

      {reviewing ? (
        <div className="modal-overlay" role="presentation" onClick={() => setReviewing(null)}>
          <div className="modal" role="dialog" aria-labelledby="review-detail-title" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="review-detail-title">
                Review record · {reviewing.industry?.name || 'Industry'}
              </h3>
              <button type="button" className="modal-close" aria-label="Close" onClick={() => setReviewing(null)}>
                ×
              </button>
            </div>
            <div style={{ marginBottom: 20, display: 'grid', gap: 10 }}>
              {[
                ['Period', `${reviewing.year} — ${reviewing.quarter}`],
                ['Park', reviewing.industry?.sipcotPark],
                ['Submitted By', reviewing.submittedBy?.name],
                ['Investment', formatInvestment(reviewing)],
                ['Turnover', reviewing.turnover?.value != null ? `₹${reviewing.turnover.value} ${reviewing.turnover.unit || ''}` : '—'],
                ['Employment', reviewing.employment?.total ?? '—'],
                ['Water Usage', `${reviewing.waterUsage?.value ?? '—'} ${reviewing.waterUsage?.unit || ''}`],
                ['Power Usage', `${reviewing.powerUsage?.value ?? '—'} ${reviewing.powerUsage?.unit || ''}`],
                ['Current Status', <StatusBadge key="st" s={reviewing.status} />],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    fontSize: '0.88rem',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: 8,
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ fontWeight: 500 }}>{v ?? '—'}</span>
                </div>
              ))}
            </div>
            <div className="form-group">
              <label className="form-label">Administrator remarks</label>
              <textarea
                className="form-textarea"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add verification notes. Required when rejecting. Visible to the industry user on their submission."
                rows={4}
              />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setReviewing(null)} disabled={saving}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                onClick={() => handleReview('Under Review')}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Mark Under Review'}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleReview('Rejected')}
                disabled={saving || !remarks.trim()}
              >
                Reject
              </button>
              <button type="button" className="btn btn-success" onClick={() => handleReview('Approved')} disabled={saving}>
                {saving ? 'Saving…' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
