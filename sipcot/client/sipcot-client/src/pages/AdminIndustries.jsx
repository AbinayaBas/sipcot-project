import React, { useEffect, useState } from 'react';
import { getAllIndustries, getIndustryById, toggleUserActive } from '../utils/api';

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

const TYPES = [
  'Manufacturing',
  'Textile',
  'Chemical',
  'Food Processing',
  'Electronics',
  'Pharmaceutical',
  'Auto Components',
  'Plastics',
  'Engineering',
  'IT/ITES',
  'Other',
];

/** Prefer year embedded in registration number (e.g. SIPCOT/TN/2015/001); fallback to commencement year. */
function registrationYearDisplay(ind) {
  const reg = ind.registrationNumber;
  if (reg) {
    const m = String(reg).match(/\b((?:19|20)\d{2})\b/);
    if (m) return m[1];
  }
  if (ind.commencementYear != null && ind.commencementYear !== '') return String(ind.commencementYear);
  return '—';
}

function formatIndustrySize(cat) {
  if (!cat) return '—';
  const s = String(cat);
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export default function AdminIndustries() {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ sipcotPark: '', type: '', status: '', search: '' });
  const [sortBy, setSortBy] = useState('recent');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [registryTotal, setRegistryTotal] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [togglingUser, setTogglingUser] = useState(null);

  const fetchList = () => {
    setLoading(true);
    getAllIndustries({
      ...filter,
      page,
      limit: 20,
      sortBy,
    })
      .then((res) => {
        setIndustries(res.data.data || []);
        setPages(res.data.pages || 1);
        setTotal(res.data.total ?? 0);
        setRegistryTotal(res.data.registryTotal ?? res.data.total ?? 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, [filter, page, sortBy]);

  const openDetails = async (ind) => {
    setDetail(ind);
    setDetailOpen(true);
    try {
      const res = await getIndustryById(ind._id);
      setDetail(res.data.data);
    } catch (_) {
      /* keep row snapshot */
    }
  };

  const refreshDetail = async (industryId) => {
    try {
      const res = await getIndustryById(industryId);
      setDetail(res.data.data);
    } catch (_) {}
  };

  const handleToggleAccount = async (userId, industryId) => {
    setTogglingUser(userId);
    try {
      await toggleUserActive(userId);
      fetchList();
      if (detailOpen && industryId) await refreshDetail(industryId);
    } catch (e) {
      alert(e.response?.data?.message || 'Error');
    } finally {
      setTogglingUser(null);
    }
  };

  const showingLine =
    total < registryTotal
      ? `Showing: ${total} of ${registryTotal}`
      : `Showing: ${total}`;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Industries</h1>
        <p style={{ maxWidth: 720 }}>
          Displays all registered industries within SIPCOT Industrial Parks. Use filters to search, categorize,
          and monitor industry details.
        </p>
        <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'baseline' }}>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Total industries: <strong style={{ color: 'var(--text)' }}>{registryTotal}</strong>
          </span>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {showingLine}
          </span>
        </div>
      </div>

      <div className="filters" style={{ flexWrap: 'wrap', gap: 10 }}>
        <input
          className="search-input"
          placeholder="Search by industry name, registration number, or location..."
          value={filter.search}
          onChange={(e) => {
            setFilter({ ...filter, search: e.target.value });
            setPage(1);
          }}
        />
        <select
          className="filter-select"
          value={filter.sipcotPark}
          onChange={(e) => {
            setFilter({ ...filter, sipcotPark: e.target.value });
            setPage(1);
          }}
        >
          <option value="">All SIPCOT Parks</option>
          {PARKS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          className="filter-select"
          value={filter.type}
          onChange={(e) => {
            setFilter({ ...filter, type: e.target.value });
            setPage(1);
          }}
        >
          <option value="">All Types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          className="filter-select"
          value={filter.status}
          onChange={(e) => {
            setFilter({ ...filter, status: e.target.value });
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          {['Active', 'Inactive', 'Under Construction', 'Closed'].map((s) => (
            <option key={s} value={s}>
              {s}
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
          aria-label="Sort industries"
        >
          <option value="recent">Sort: Recent</option>
          <option value="name">Sort: Name (A–Z)</option>
          <option value="park">Sort: Park</option>
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
        <strong style={{ color: 'var(--text)' }}>Status</strong> reflects the unit’s operational classification in
        this directory (e.g. Active, Closed). <strong style={{ color: 'var(--text)' }}>Portal access</strong> shows
        whether the linked user account may sign in; use Actions to review the profile and manage access.
      </p>

      <div className="card" style={{ marginTop: 16 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : industries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏭</div>
            <p>No industries found.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Reg. No.</th>
                  <th>Year</th>
                  <th>Type</th>
                  <th>Industry Size</th>
                  <th>Park</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Portal access</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {industries.map((ind) => (
                  <tr key={ind._id}>
                    <td style={{ fontWeight: 500 }}>{ind.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{ind.registrationNumber || '—'}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{registrationYearDisplay(ind)}</td>
                    <td style={{ fontSize: '0.82rem' }}>{ind.type}</td>
                    <td>
                      <span className="badge badge-info">{formatIndustrySize(ind.category)}</span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{ind.sipcotPark}</td>
                    <td style={{ fontSize: '0.82rem' }}>{ind.location?.city || '—'}</td>
                    <td>
                      <span
                        className={`badge ${
                          ind.status === 'Active'
                            ? 'badge-success'
                            : ind.status === 'Closed'
                              ? 'badge-danger'
                              : 'badge-warning'
                        }`}
                      >
                        {ind.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem' }}>
                      {ind.user ? (
                        <span className={`badge ${ind.user.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {ind.user.isActive ? 'Allowed' : 'Blocked'}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {ind.contactPerson?.name || ind.user?.name || '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => openDetails(ind)}>
                          View Details
                        </button>
                        {ind.user?._id ? (
                          <button
                            type="button"
                            className={`btn btn-sm ${ind.user.isActive ? 'btn-danger' : 'btn-success'}`}
                            disabled={togglingUser === ind.user._id}
                            onClick={() => handleToggleAccount(ind.user._id, ind._id)}
                          >
                            {togglingUser === ind.user._id
                              ? 'Please wait…'
                              : ind.user.isActive
                                ? 'Deactivate'
                                : 'Activate'}
                          </button>
                        ) : null}
                      </div>
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

      {detailOpen && detail ? (
        <div className="modal-overlay" role="presentation" onClick={() => setDetailOpen(false)}>
          <div className="modal" role="dialog" aria-labelledby="ind-detail-title" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="ind-detail-title">Industry profile</h3>
              <button type="button" className="modal-close" aria-label="Close" onClick={() => setDetailOpen(false)}>
                ×
              </button>
            </div>
            <div style={{ maxHeight: '62vh', overflow: 'auto', fontSize: '0.9rem', lineHeight: 1.65 }}>
              <div style={{ fontWeight: 800, fontFamily: 'var(--font-head)', fontSize: '1.05rem', marginBottom: 12 }}>
                {detail.name}
              </div>
              <dl style={{ display: 'grid', gap: 10, margin: 0 }}>
                <div>
                  <dt style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Registration No.</dt>
                  <dd style={{ margin: '4px 0 0' }}>{detail.registrationNumber || '—'}</dd>
                </div>
                <div>
                  <dt style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Year of registration</dt>
                  <dd style={{ margin: '4px 0 0' }}>{registrationYearDisplay(detail)}</dd>
                </div>
                <div>
                  <dt style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Type &amp; industry size</dt>
                  <dd style={{ margin: '4px 0 0' }}>
                    {detail.type} · {formatIndustrySize(detail.category)}
                  </dd>
                </div>
                <div>
                  <dt style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>SIPCOT park</dt>
                  <dd style={{ margin: '4px 0 0' }}>{detail.sipcotPark}</dd>
                </div>
                <div>
                  <dt style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Operational status</dt>
                  <dd style={{ margin: '4px 0 0' }}>
                    <span
                      className={`badge ${
                        detail.status === 'Active'
                          ? 'badge-success'
                          : detail.status === 'Closed'
                            ? 'badge-danger'
                            : 'badge-warning'
                      }`}
                    >
                      {detail.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Location</dt>
                  <dd style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>
                    {[detail.location?.address, detail.location?.city, detail.location?.district, detail.location?.pincode]
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </dd>
                </div>
                <div>
                  <dt style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Contact person</dt>
                  <dd style={{ margin: '4px 0 0' }}>
                    {detail.contactPerson?.name || '—'}
                    {detail.contactPerson?.designation ? ` · ${detail.contactPerson.designation}` : ''}
                    <br />
                    {detail.contactPerson?.email || detail.user?.email || ''}
                    {detail.contactPerson?.phone || detail.user?.phone
                      ? ` · ${detail.contactPerson?.phone || detail.user?.phone}`
                      : ''}
                  </dd>
                </div>
                <div>
                  <dt style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Allotted area</dt>
                  <dd style={{ margin: '4px 0 0' }}>
                    {detail.allottedArea?.value != null
                      ? `${detail.allottedArea.value} ${detail.allottedArea.unit || ''}`.trim()
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Commencement year</dt>
                  <dd style={{ margin: '4px 0 0' }}>{detail.commencementYear ?? '—'}</dd>
                </div>
                {detail.description ? (
                  <div>
                    <dt style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Notes</dt>
                    <dd style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap', color: 'var(--text-muted)' }}>
                      {detail.description}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Linked portal account</dt>
                  <dd style={{ margin: '4px 0 0' }}>
                    {detail.user ? (
                      <>
                        <div>{detail.user.name}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{detail.user.email}</div>
                        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                          <span className={`badge ${detail.user.isActive ? 'badge-success' : 'badge-danger'}`}>
                            {detail.user.isActive ? 'Access allowed' : 'Access blocked'}
                          </span>
                          <button
                            type="button"
                            className={`btn btn-sm ${detail.user.isActive ? 'btn-danger' : 'btn-success'}`}
                            disabled={togglingUser === detail.user._id}
                            onClick={() => handleToggleAccount(detail.user._id, detail._id)}
                          >
                            {togglingUser === detail.user._id
                              ? 'Please wait…'
                              : detail.user.isActive
                                ? 'Deactivate account'
                                : 'Activate account'}
                          </button>
                        </div>
                      </>
                    ) : (
                      'No linked user account'
                    )}
                  </dd>
                </div>
              </dl>
            </div>
            <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setDetailOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
