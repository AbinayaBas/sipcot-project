import React, { useEffect, useMemo, useState } from 'react';
import {
  createScheduleItem,
  deleteScheduleItem,
  getSchedule,
  toggleScheduleItem,
  updateScheduleStatus,
} from '../utils/api';
import {
  displayScheduleType,
  scheduleEventStatusBadgeClass,
  scheduleEventStatusLabel,
  scheduleTypeBadgeClass,
} from '../utils/scheduleDisplay';

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

const SCHEDULE_TYPES = [
  'Inspection',
  'Submission Deadline',
  'Review Meeting',
  'Compliance Check',
];

export default function AdminSchedule() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOnly, setActiveOnly] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [saving, setSaving] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    type: 'Inspection',
    audience: 'all',
    audienceValue: '',
    location: '',
    reminder24h: false,
  });

  const audienceOptions = useMemo(() => {
    if (form.audience === 'park') return PARKS;
    if (form.audience === 'type') return TYPES;
    return [];
  }, [form.audience]);

  const fetchList = () => {
    setLoading(true);
    getSchedule({ active: activeOnly ? 'true' : '', page, limit: 10 })
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

  const resetForm = () =>
    setForm({
      title: '',
      description: '',
      date: '',
      type: 'Inspection',
      audience: 'all',
      audienceValue: '',
      location: '',
      reminder24h: false,
    });

  const submit = async () => {
    if (!form.title.trim() || !form.date) return alert('Title and date are required');
    if (form.audience !== 'all' && !form.audienceValue) return alert('Select an audience value');
    setSaving(true);
    try {
      await createScheduleItem({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        date: new Date(form.date).toISOString(),
        type: form.type,
        audience: form.audience,
        audienceValue: form.audience === 'all' ? undefined : form.audienceValue,
        location: form.location.trim() || undefined,
        reminder24h: form.reminder24h,
      });
      resetForm();
      setPage(1);
      fetchList();
    } catch (e) {
      alert(e.response?.data?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const setEventStatus = async (id, eventStatus) => {
    setStatusUpdating(id);
    try {
      await updateScheduleStatus(id, eventStatus);
      fetchList();
    } catch (e) {
      alert(e.response?.data?.message || 'Error');
    } finally {
      setStatusUpdating(null);
    }
  };

  const toggle = async (id) => {
    await toggleScheduleItem(id);
    fetchList();
  };

  const del = async (id) => {
    if (!window.confirm('Delete this schedule item?')) return;
    await deleteScheduleItem(id);
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
        <h1>Inspection & Review Schedule</h1>
        <p style={{ maxWidth: 720 }}>
          Plan and manage inspections, submission deadlines, and review activities for industries. This module
          helps coordinate administrative schedules across industrial parks.
        </p>
        <p style={{ marginTop: 8, fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 300 }}>
          Showing <strong style={{ color: 'var(--text)' }}>{total}</strong> schedule{' '}
          {total === 1 ? 'item' : 'items'} for the current filter.
        </p>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="section-title">Create schedule item</div>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              className="form-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Eg: Q2 compliance inspection — Hosur I"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date & time</label>
              <input
                className="form-input"
                type="datetime-local"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {SCHEDULE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Location (Industrial Park / Unit)</label>
            <input
              className="form-input"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Hosur I · Block A, or online review link"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Enter additional details such as location, instructions, required documents, or contact information."
            />
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

          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              cursor: 'pointer',
              marginBottom: 14,
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
            }}
          >
            <input
              type="checkbox"
              checked={form.reminder24h}
              onChange={(e) => setForm({ ...form, reminder24h: e.target.checked })}
              style={{ marginTop: 3 }}
            />
            <span>
              <strong style={{ color: 'var(--text)' }}>Reminder (24 hrs before)</strong>
              <br />
              <span style={{ fontSize: '0.82rem' }}>
                Marks this entry for a one-day advance reminder in future notification workflows (administrative
                concept for this prototype).
              </span>
            </span>
          </label>

          <button className="btn btn-primary" disabled={saving} onClick={submit}>
            {saving ? 'Saving…' : 'Add to schedule'}
          </button>
          <p style={{ marginTop: 12, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
            Scheduled items will be visible to selected industries in their dashboard.
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
          <div style={{ marginTop: 14, color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: 1.65 }}>
            <p style={{ margin: '0 0 8px' }}>
              Each item has an <strong style={{ color: 'var(--text)' }}>event status</strong>:{' '}
              <span className="badge badge-info">Upcoming</span>{' '}
              <span className="badge badge-success">Completed</span>{' '}
              <span className="badge badge-danger">Cancelled</span>
              — adjust these in the list below.
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: 'var(--text)' }}>Guideline:</strong> Use “Submission Deadline” for reporting
              cut-off dates and “Inspection” for planned site visits. Ensure schedules are updated regularly to
              maintain coordination.
            </p>
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
            <div className="empty-icon">📅</div>
            <p>No schedule items found.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {list.map((i) => {
              const ev = i.eventStatus || 'upcoming';
              return (
                <div
                  key={i._id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    padding: 16,
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 900, fontFamily: 'var(--font-head)' }}>{i.title}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className={`badge ${scheduleTypeBadgeClass(i.type)}`}>{displayScheduleType(i.type)}</span>
                      <span className={`badge ${scheduleEventStatusBadgeClass(ev)}`}>
                        {scheduleEventStatusLabel(ev)}
                      </span>
                    </div>
                  </div>
                  <div style={{ marginTop: 6, color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                    {i.date ? new Date(i.date).toLocaleString() : '—'} · {audienceSummary(i.audience, i.audienceValue)}
                  </div>
                  {i.location ? (
                    <div style={{ marginTop: 8, fontSize: '0.86rem', color: 'var(--text)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Location:</span> {i.location}
                    </div>
                  ) : null}
                  {i.reminder24h ? (
                    <div style={{ marginTop: 6, fontSize: '0.78rem', color: 'var(--accent)' }}>
                      Reminder (24 hrs before) — flagged for administrative follow-up.
                    </div>
                  ) : null}
                  {i.description ? (
                    <div
                      style={{
                        marginTop: 10,
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem',
                        lineHeight: 1.65,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {i.description}
                    </div>
                  ) : null}
                  <div
                    style={{
                      marginTop: 12,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 8,
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginRight: 4 }}>
                      Set status:
                    </span>
                    {['upcoming', 'completed', 'cancelled'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`btn btn-sm ${ev === s ? 'btn-primary' : 'btn-secondary'}`}
                        disabled={statusUpdating === i._id}
                        onClick={() => setEventStatus(i._id, s)}
                      >
                        {s === 'upcoming' ? 'Upcoming' : s === 'completed' ? 'Completed' : 'Cancelled'}
                      </button>
                    ))}
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      borderTop: '1px solid var(--border)',
                      paddingTop: 12,
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      List archive:{' '}
                      <span style={{ color: 'var(--text)' }}>{i.isActive ? 'active' : 'archived'}</span>
                      {i.createdBy?.name ? (
                        <span>
                          {' '}
                          · Created by {i.createdBy.name}
                        </span>
                      ) : null}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => toggle(i._id)}>
                        {i.isActive ? 'Archive' : 'Unarchive'}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(i._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pages > 1 && (
          <div className="pagination">
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
              ←
            </button>
            {Array.from({ length: Math.min(pages, 7) }, (_, idx) => idx + 1).map((p) => (
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
