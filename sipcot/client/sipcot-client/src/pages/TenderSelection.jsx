import React, { useEffect, useMemo, useState } from 'react';
import { getTenderEligible } from '../utils/api';

export default function TenderSelection() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [topFilter, setTopFilter] = useState('all'); // all | 5 | 10

  useEffect(() => {
    setLoading(true);
    setError('');
    getTenderEligible()
      .then((res) => {
        setRows(res.data.data || []);
        setMeta(res.data.meta || null);
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message ||
          err.message ||
          (err.code === 'ERR_NETWORK' ? 'Cannot reach server — start the API (e.g. port 5000) or check REACT_APP_API_URL.' : null);
        setError(msg || 'Could not load ranking');
      })
      .finally(() => setLoading(false));
  }, []);

  const threshold = meta?.threshold ?? 60;

  const displayed = useMemo(() => {
    if (!rows.length) return [];
    if (topFilter === '5') return rows.slice(0, 5);
    if (topFilter === '10') return rows.slice(0, 10);
    return rows;
  }, [rows, topFilter]);

  const rowAccent = (rank) => {
    if (rank === 1) return 'rgba(212, 175, 55, 0.14)';
    if (rank === 2) return 'rgba(192, 192, 192, 0.12)';
    if (rank === 3) return 'rgba(205, 127, 50, 0.12)';
    return 'transparent';
  };

  return (
    <div className="fade-in tender-eligibility-page">
      <div className="page-header">
        <h1>Tender Eligibility Ranking System</h1>
        <p style={{ maxWidth: 780 }}>
          This system ranks industries based on investment, employment, growth trends, and compliance factors to assist
          officers in tender selection.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: 560 }}>
            Composite score uses normalized inputs (0–100 each): investment ({meta?.weights?.investment ?? 0.3}), employment (
            {meta?.weights?.employment ?? 0.2}), YoY growth ({meta?.weights?.growthRate ?? 0.2}), compliance (
            {meta?.weights?.compliance ?? 0.2}), submission consistency ({meta?.weights?.submissionConsistency ?? 0.1}). Recommended if
            score &gt; <strong style={{ color: 'var(--accent)' }}>{threshold}</strong>.
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Show
            </span>
            {[
              { id: 'all', label: 'All' },
              { id: '10', label: 'Top 10' },
              { id: '5', label: 'Top 5' },
            ].map((o) => (
              <button
                key={o.id}
                type="button"
                className={`btn btn-sm ${topFilter === o.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTopFilter(o.id)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : displayed.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>No industries registered.</p>
        ) : (
          <div className="table-wrap">
            <table className="tender-eligibility-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Industry Name</th>
                  <th>Park</th>
                  <th>Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((r) => (
                  <tr
                    key={r.industryId}
                    style={{
                      background: rowAccent(r.rank),
                      outline: r.rank <= 3 ? `1px solid ${r.rank === 1 ? 'rgba(212,175,55,0.35)' : r.rank === 2 ? 'rgba(180,180,190,0.35)' : 'rgba(205,127,50,0.35)'}` : undefined,
                    }}
                  >
                    <td style={{ fontWeight: 800, fontFamily: 'var(--font-head)' }}>{r.rank}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.industryName}</div>
                      {!r.hasApprovedData ? (
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 4 }}>
                          No approved MIS data — score defaults to baseline
                        </div>
                      ) : r.latestPeriod ? (
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 4 }}>
                          Latest approved: {r.latestPeriod}
                        </div>
                      ) : null}
                    </td>
                    <td>{r.sipcotPark || '—'}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {(Number.isFinite(Number(r.score)) ? Number(r.score) : 0).toFixed(1)}
                    </td>
                    <td>
                      <span
                        className={`badge ${(r.statusLabel || 'Average') === 'Recommended' ? 'badge-success' : 'badge-muted'}`}
                      >
                        {r.statusLabel || 'Average'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && meta ? (
        <p style={{ marginTop: 16, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Decision-support output only — officers should corroborate with statutory checks and procurement rules before shortlisting.
        </p>
      ) : null}
    </div>
  );
}
