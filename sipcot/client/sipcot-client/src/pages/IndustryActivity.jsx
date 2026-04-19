import React, { useEffect, useState } from 'react';
import { getMyActivity } from '../utils/api';

function formatDt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function IndustryActivity() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError('');
    getMyActivity({ page })
      .then((res) => {
        setLogs(res.data.data || []);
        setTotal(res.data.total ?? 0);
        setPages(res.data.pages ?? 0);
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message ||
          err.message ||
          (err.code === 'ERR_NETWORK' ? 'Cannot reach server — start the API or check REACT_APP_API_URL.' : null);
        setError(msg || 'Could not load activity');
        setLogs([]);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Activity history</h1>
        <p style={{ maxWidth: 720 }}>
          Your actions on this portal and administrator decisions on your unit&apos;s submissions (approve / reject / review)
          appear here for transparency.
        </p>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : logs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            No activity recorded yet — submit data or update your profile to see entries.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12 }}>
            {logs.map((row, idx) => (
              <li
                key={row._id ? String(row._id) : `log-${idx}`}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'rgba(0,0,0,0.18)',
                }}
              >
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 6 }}>{formatDt(row.createdAt)}</div>
                <div style={{ fontSize: '0.92rem', lineHeight: 1.5 }}>{row.summary}</div>
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  <span className="badge badge-muted">{row.action}</span>
                  {row.actor?.name ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      By {row.actor.name}
                      {row.actorRole === 'admin' ? ' (administrator)' : ''}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}

        {!loading && pages > 1 ? (
          <div style={{ marginTop: 18, display: 'flex', gap: 10, alignItems: 'center' }}>
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
