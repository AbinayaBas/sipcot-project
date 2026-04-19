import React, { useEffect, useMemo, useState } from 'react';
import { deleteDocument, downloadDocumentUrl, getDocuments, toggleDocument, uploadDocument } from '../utils/api';
import {
  DOCUMENT_CATEGORY_FILTER_OPTIONS,
  DOCUMENT_CATEGORY_OPTIONS,
  displayDocumentCategory,
  documentShowsUpdatedBadge,
} from '../utils/documentDisplay';

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
  'Other',
];
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

export default function AdminDocuments() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOnly, setActiveOnly] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [titleSearch, setTitleSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Guideline',
    versionYear: '',
    audience: 'all',
    audienceValue: '',
    file: null,
  });

  const audienceOptions = useMemo(() => {
    if (form.audience === 'park') return PARKS;
    if (form.audience === 'type') return TYPES;
    return [];
  }, [form.audience]);

  const fetchList = () => {
    setLoading(true);
    getDocuments({
      active: activeOnly ? 'true' : '',
      category: categoryFilter || undefined,
      q: titleSearch.trim() || undefined,
      page,
      limit: 10,
    })
      .then((res) => {
        setList(res.data.data || []);
        setPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, [activeOnly, categoryFilter, titleSearch, page]);

  const submit = async () => {
    if (!form.title.trim() || !form.file) return alert('Title and file are required');
    if (form.audience !== 'all' && !form.audienceValue) return alert('Select an audience value');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      if (form.description.trim()) fd.append('description', form.description.trim());
      fd.append('category', form.category);
      if (form.versionYear.trim()) fd.append('versionYear', form.versionYear.trim());
      fd.append('audience', form.audience);
      if (form.audience !== 'all') fd.append('audienceValue', form.audienceValue);
      fd.append('file', form.file);
      await uploadDocument(fd);
      setForm({
        title: '',
        description: '',
        category: 'Guideline',
        versionYear: '',
        audience: 'all',
        audienceValue: '',
        file: null,
      });
      setPage(1);
      fetchList();
    } catch (e) {
      alert(e.response?.data?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (id) => {
    await toggleDocument(id);
    fetchList();
  };

  const del = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    await deleteDocument(id);
    fetchList();
  };

  const audienceSummary = (audience, audienceValue) => {
    if (audience === 'all') return 'All industries';
    if (audience === 'park') return audienceValue ? `By park · ${audienceValue}` : 'By park';
    return audienceValue ? `By industry type · ${audienceValue}` : 'By industry type';
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Documents</h1>
        <p style={{ maxWidth: 720 }}>
          Upload and manage official documents such as circulars, guidelines, SOPs, and forms. Documents can be
          categorized and shared with relevant industries.
        </p>
        <p style={{ marginTop: 8, fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 300 }}>
          Showing <strong style={{ color: 'var(--text)' }}>{total}</strong> document{total === 1 ? '' : 's'} for the
          current filter.
        </p>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="section-title">Upload document</div>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              className="form-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Eg: Safety & compliance guideline (2026)"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <textarea
              className="form-textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Provide a brief summary, purpose, and any important instructions related to this document."
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {DOCUMENT_CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Version / Year</label>
              <input
                className="form-input"
                value={form.versionYear}
                onChange={(e) => setForm({ ...form, versionYear: e.target.value })}
                placeholder="e.g. 2026, v1.2"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">File (PDF / Excel)</label>
              <input
                className="form-input"
                type="file"
                onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Audience</label>
              <select
                className="form-select"
                value={form.audience}
                onChange={(e) => setForm({ ...form, audience: e.target.value, audienceValue: '' })}
              >
                <option value="all">All industries</option>
                <option value="park">By Park</option>
                <option value="type">By Industry Type</option>
              </select>
            </div>
            {form.audience !== 'all' ? (
              <div className="form-group">
                <label className="form-label">{form.audience === 'park' ? 'SIPCOT Park' : 'Industry Type'}</label>
                <select
                  className="form-select"
                  value={form.audienceValue}
                  onChange={(e) => setForm({ ...form, audienceValue: e.target.value })}
                >
                  <option value="">Select…</option>
                  {audienceOptions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>

          <button className="btn btn-primary" disabled={saving} onClick={submit}>
            {saving ? 'Uploading…' : 'Upload'}
          </button>
          <p style={{ marginTop: 12, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
            Uploaded documents will be accessible to selected industries in their portal.
          </p>
          <div style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
            Supported formats: PDF, Excel. Maximum file size: 15 MB. Use archive for outdated documents.
          </div>
        </div>

        <div className="card">
          <div className="section-title">Filters</div>
          <div className="filters" style={{ marginBottom: 0, flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
            <input
              className="form-input"
              type="search"
              value={titleSearch}
              placeholder="Search by title"
              onChange={(e) => {
                setTitleSearch(e.target.value);
                setPage(1);
              }}
              aria-label="Search documents by title"
            />
            <select
              className="filter-select"
              value={activeOnly ? 'active' : 'all'}
              onChange={(e) => {
                setActiveOnly(e.target.value === 'active');
                setPage(1);
              }}
            >
              <option value="active">Active only</option>
              <option value="all">All (active + archived)</option>
            </select>
            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All categories</option>
              {DOCUMENT_CATEGORY_FILTER_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : list.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <p>No documents found.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {list.map((d) => (
              <div
                key={d._id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: 16,
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 900, fontFamily: 'var(--font-head)' }}>{d.title}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <span className="badge badge-info">{displayDocumentCategory(d.category)}</span>
                    <span className={`badge ${d.isActive ? 'badge-success' : 'badge-muted'}`}>
                      {d.isActive ? 'Active' : 'Archived'}
                    </span>
                    {documentShowsUpdatedBadge(d) ? (
                      <span className="badge badge-warning" title="Metadata or file record changed after upload">
                        Updated
                      </span>
                    ) : null}
                  </div>
                </div>
                {d.versionYear ? (
                  <div style={{ marginTop: 8, fontSize: '0.86rem', color: 'var(--text)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Version / Year:</span> {d.versionYear}
                  </div>
                ) : null}
                {d.description ? (
                  <div
                    style={{
                      marginTop: 8,
                      color: 'var(--text-muted)',
                      fontSize: '0.9rem',
                      lineHeight: 1.7,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {d.description}
                  </div>
                ) : null}
                <div style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {audienceSummary(d.audience, d.audienceValue)}
                  <span style={{ opacity: 0.85 }}>
                    {' '}
                    · Uploaded {d.createdAt ? new Date(d.createdAt).toLocaleString() : '—'}
                  </span>
                  {d.file?.originalName ? (
                    <span style={{ opacity: 0.85 }}> · {d.file.originalName}</span>
                  ) : null}
                  <span style={{ opacity: 0.85 }}> · Downloaded {Number(d.downloadCount) || 0} times</span>
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a className="btn btn-secondary btn-sm" href={downloadDocumentUrl(d._id)} target="_blank" rel="noreferrer">
                    Download
                  </a>
                  <button className="btn btn-secondary btn-sm" onClick={() => toggle(d._id)}>
                    {d.isActive ? 'Archive' : 'Unarchive'}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => del(d._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
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
    </div>
  );
}
