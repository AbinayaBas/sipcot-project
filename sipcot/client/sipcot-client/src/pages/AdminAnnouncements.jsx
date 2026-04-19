import React, { useEffect, useMemo, useState } from 'react';
import { createAnnouncement, deleteAnnouncement, getAnnouncements, toggleAnnouncement } from '../utils/api';

const TYPES = ['Manufacturing', 'Textile', 'Chemical', 'Food Processing', 'Electronics', 'Pharmaceutical', 'Auto Components', 'Plastics', 'Engineering', 'Other'];
const PARKS = ['Hosur I', 'Hosur II', 'Perundurai', 'Oragadam', 'Sriperumbudur', 'Ranipet', 'Gummidipoondi', 'Irrungattukottai', 'Cuddalore', 'Tuticorin', 'Other'];

const ANNOUNCEMENT_TYPES = [
  { value: 'general', label: 'General Notice' },
  { value: 'deadline', label: 'Deadline / Submission' },
  { value: 'inspection', label: 'Inspection / Audit' },
  { value: 'policy', label: 'Policy Update' },
];

const TYPE_LABEL = Object.fromEntries(ANNOUNCEMENT_TYPES.map((t) => [t.value, t.label]));

function audienceSummary(audience, audienceValue) {
  if (audience === 'all') return 'All industries';
  if (audience === 'park') return `By park · ${audienceValue || '—'}`;
  return `By industry type · ${audienceValue || '—'}`;
}

export default function AdminAnnouncements() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOnly, setActiveOnly] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [publishNotice, setPublishNotice] = useState(null);

  const [form, setForm] = useState({
    title: '',
    message: '',
    announcementType: 'general',
    effectiveDate: '',
    priority: 'normal',
    audience: 'all',
    audienceValue: '',
  });

  const audienceOptions = useMemo(() => {
    if (form.audience === 'park') return PARKS;
    if (form.audience === 'type') return TYPES;
    return [];
  }, [form.audience]);

  const fetchList = () => {
    setLoading(true);
    getAnnouncements({ active: activeOnly ? 'true' : '', page, limit: 10 })
      .then((res) => {
        setList(res.data.data || []);
        setPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, [activeOnly, page]);

  const submit = async () => {
    if (!form.title.trim() || !form.message.trim()) return alert('Title and message are required');
    if (form.audience !== 'all' && !form.audienceValue) return alert('Select park or industry type');
    setSaving(true);
    try {
      await createAnnouncement({
        title: form.title.trim(),
        message: form.message.trim(),
        announcementType: form.announcementType,
        effectiveDate: form.effectiveDate || undefined,
        priority: form.priority,
        audience: form.audience,
        audienceValue: form.audience === 'all' ? undefined : form.audienceValue,
      });
      setForm({
        title: '',
        message: '',
        announcementType: 'general',
        effectiveDate: '',
        priority: 'normal',
        audience: 'all',
        audienceValue: '',
      });
      setPreviewOpen(false);
      setPage(1);
      fetchList();
      setPublishNotice({ type: 'success', text: 'Announcement published successfully.' });
      window.setTimeout(() => setPublishNotice(null), 6000);
    } catch (e) {
      alert(e.response?.data?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (id) => {
    await toggleAnnouncement(id);
    fetchList();
  };

  const del = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    await deleteAnnouncement(id);
    fetchList();
  };

  const previewPayload = useMemo(
    () => ({
      ...form,
      audienceLabel: audienceSummary(form.audience, form.audienceValue),
      typeLabel: TYPE_LABEL[form.announcementType] || form.announcementType,
    }),
    [form]
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Announcements</h1>
        <p style={{ maxWidth: 720 }}>
          Create and manage official announcements for industries. Use this module to publish circulars, deadlines, and important updates.
        </p>
        <p style={{ marginTop: 8, fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 300 }}>
          Showing <strong style={{ color: 'var(--text)' }}>{total}</strong> announcement{total === 1 ? '' : 's'} for the current filter.
        </p>
      </div>

      {publishNotice ? (
        <div className={`alert alert-${publishNotice.type}`} role="status">
          {publishNotice.text}
        </div>
      ) : null}

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="section-title">Create announcement</div>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              className="form-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Quarterly submission deadline"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              className="form-textarea"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Write the announcement details…"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Announcement type</label>
              <select
                className="form-select"
                value={form.announcementType}
                onChange={(e) => setForm({ ...form, announcementType: e.target.value })}
              >
                {ANNOUNCEMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Effective date</label>
              <input
                type="date"
                className="form-input"
                value={form.effectiveDate}
                onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
              />
              <span style={{ display: 'block', marginTop: 6, fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 300 }}>
                Optional — use for deadlines, scheduled notices, or audit windows.
              </span>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Audience</label>
              <select
                className="form-select"
                value={form.audience}
                onChange={(e) => setForm({ ...form, audience: e.target.value, audienceValue: '' })}
              >
                <option value="all">All industries</option>
                <option value="park">By park</option>
                <option value="type">By industry type</option>
              </select>
            </div>
          </div>

          {form.audience !== 'all' && (
            <div className="form-group">
              <label className="form-label">{form.audience === 'park' ? 'SIPCOT park' : 'Industry type'}</label>
              <select className="form-select" value={form.audienceValue} onChange={(e) => setForm({ ...form, audienceValue: e.target.value })}>
                <option value="">Select…</option>
                {audienceOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginTop: 4 }}>
            <button type="button" className="btn btn-secondary" disabled={saving} onClick={() => setPreviewOpen(true)}>
              Preview announcement
            </button>
            <button type="button" className="btn btn-primary" disabled={saving} onClick={submit}>
              {saving ? 'Posting…' : 'Post announcement'}
            </button>
          </div>
          <p style={{ marginTop: 14, marginBottom: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.55, fontWeight: 300 }}>
            Once published, announcements will be visible to selected industries in their dashboard (Updates center).
          </p>
        </div>

        <div className="card">
          <div className="section-title">View</div>
          <div className="filters" style={{ marginBottom: 0 }}>
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
          </div>
          <div style={{ marginTop: 14, color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.65, fontWeight: 300 }}>
            <strong style={{ color: 'var(--text)', fontWeight: 700 }}>Guideline:</strong> Use “High” priority for urgent communications such as deadlines or inspections. Older announcements should be archived to maintain record history.
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
            <div className="empty-icon">📣</div>
            <p>No announcements found.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {list.map((a) => (
              <div
                key={a._id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: 16,
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 800, fontFamily: 'var(--font-head)', flex: '1 1 200px' }}>{a.title}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <span className={`badge ${a.isActive ? 'badge-success' : 'badge-muted'}`}>{a.isActive ? 'Active' : 'Archived'}</span>
                    {a.priority === 'high' ? <span className="badge badge-danger">High priority</span> : null}
                  </div>
                </div>
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <span className="badge badge-info">{TYPE_LABEL[a.announcementType] || 'General Notice'}</span>
                  {a.effectiveDate ? (
                    <span className="badge badge-muted">
                      Effective {new Date(a.effectiveDate).toLocaleDateString()}
                    </span>
                  ) : null}
                </div>
                <div style={{ marginTop: 10, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {a.message}
                </div>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {audienceSummary(a.audience, a.audienceValue)}
                    <span style={{ opacity: 0.85 }}>
                      {' '}
                      · Priority: {a.priority}
                      {' '}
                      · Posted {a.createdAt ? new Date(a.createdAt).toLocaleString() : '—'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => toggle(a._id)}>
                      {a.isActive ? 'Archive' : 'Unarchive'}
                    </button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => del(a._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="pagination">
            <button type="button" className="page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
              ←
            </button>
            {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map((p) => (
              <button key={p} type="button" className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>
                {p}
              </button>
            ))}
            <button type="button" className="page-btn" disabled={page === pages} onClick={() => setPage(page + 1)}>
              →
            </button>
          </div>
        )}
      </div>

      {previewOpen ? (
        <div className="modal-overlay" role="presentation" onClick={() => setPreviewOpen(false)}>
          <div
            className="modal admin-announce-preview-modal"
            role="dialog"
            aria-labelledby="ann-preview-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="ann-preview-title">Preview</h3>
              <button type="button" className="modal-close" aria-label="Close" onClick={() => setPreviewOpen(false)}>
                ×
              </button>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 800, fontFamily: 'var(--font-head)', fontSize: '1.05rem' }}>
                {previewPayload.title || '(No title)'}
              </div>
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <span className="badge badge-info">{previewPayload.typeLabel}</span>
                <span className={`badge ${previewPayload.priority === 'high' ? 'badge-danger' : 'badge-muted'}`}>
                  {previewPayload.priority}
                </span>
                {previewPayload.effectiveDate ? (
                  <span className="badge badge-muted">
                    Effective {new Date(previewPayload.effectiveDate).toLocaleDateString()}
                  </span>
                ) : null}
              </div>
              <div style={{ marginTop: 8, fontSize: '0.82rem', color: 'var(--text-muted)' }}>{previewPayload.audienceLabel}</div>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.75, whiteSpace: 'pre-wrap', maxHeight: '45vh', overflow: 'auto' }}>
              {previewPayload.message || '(No message)'}
            </div>
            <div style={{ marginTop: 18, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setPreviewOpen(false)}>
                Close
              </button>
              <button type="button" className="btn btn-primary" disabled={saving} onClick={submit}>
                {saving ? 'Posting…' : 'Post announcement'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
