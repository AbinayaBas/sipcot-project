import React, { useEffect, useMemo, useState } from 'react';
import { getAuditLogs } from '../utils/api';

function formatDt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(t);
  }, [search]);

  const params = useMemo(() => {
    const p = { page };
    if (debouncedSearch) p.q = debouncedSearch;
    if (roleFilter === 'admin' || roleFilter === 'industry') p.role = roleFilter;
    return p;
  }, [page, debouncedSearch, roleFilter]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter]);

  useEffect(() => {
    setLoading(true);
    setError('');
    getAuditLogs(params)
      .then((res) => {
        setLogs(Array.isArray(res.data?.data) ? res.data.data : []);
        setTotal(res.data?.total ?? 0);
        setPages(res.data?.pages ?? 0);
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message ||
          err.message ||
          (err.code === 'ERR_NETWORK'
            ? 'Cannot reach API server — start the backend (port 5000) or fix REACT_APP_API_URL in .env.'
            : null);
        setError(msg || 'Could not load audit logs');
        setLogs([]);
      })
      .finally(() => setLoading(false));
  }, [params]);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Audit logs</h1>
        <p style={{ maxWidth: 720 }}>
          Accountability trail for major actions: submissions, reviews, profile changes, and account activation. Mirrors
          how production systems preserve traceability for oversight and audits.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
            <label className="form-label">Search summary</label>
            <input
              className="form-input"
              placeholder="e.g. submitted, approved, Rajesh"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ flex: '0 1 160px', marginBottom: 0 }}>
            <label className="form-label">Actor role</label>
            <select className="form-input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All</option>
              <option value="admin">Admin</option>
              <option value="industry">Industry</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : logs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>No audit entries match these filters.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>When</th>
                  <th>Actor</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Summary</th>
                  <th>Industry</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((row, idx) => (
                  <tr key={row._id ? String(row._id) : `audit-${idx}`}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>{formatDt(row.createdAt)}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{row.actor?.name || '—'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{row.actor?.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${row.actorRole === 'admin' ? 'badge-info' : 'badge-muted'}`}>
                        {row.actorRole}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', fontFamily: 'ui-monospace, monospace' }}>{row.action}</td>
                    <td style={{ maxWidth: 360, fontSize: '0.88rem', lineHeight: 1.45 }}>{row.summary}</td>
                    <td style={{ fontSize: '0.82rem' }}>
                      {row.industry?.name ? (
                        <>
                          {row.industry.name}
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                            {row.industry.sipcotPark || ''}
                          </div>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && pages > 1 ? (
          <div style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Page {page} of {pages} ({total} entries)
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
