import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { downloadMyDocumentUrl, getMyAnnouncements, getMyDocuments, getMySchedule } from '../utils/api';
import {
  displayScheduleType,
  scheduleEventStatusBadgeClass,
  scheduleEventStatusLabel,
  scheduleTypeBadgeClass,
} from '../utils/scheduleDisplay';
import { displayDocumentCategory } from '../utils/documentDisplay';

const ANNOUNCEMENT_TYPE_LABEL = {
  general: 'General Notice',
  deadline: 'Deadline / Submission',
  inspection: 'Inspection / Audit',
  policy: 'Policy Update',
};

const TAB_FROM_HASH = {
  '#announcements': 'announcements',
  '#schedule': 'schedule',
  '#documents': 'documents',
};

export default function IndustryUpdates() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState(() => TAB_FROM_HASH[location.hash] || 'announcements');
  const [loading, setLoading] = useState(true);

  const [ann, setAnn] = useState([]);
  const [sch, setSch] = useState([]);
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([getMyAnnouncements({ limit: 50 }), getMySchedule({ limit: 50, upcoming: 'false' }), getMyDocuments({ limit: 50 })])
      .then(([a, s, d]) => {
        setAnn(a.data.data || []);
        setSch(s.data.data || []);
        setDocs(d.data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = TAB_FROM_HASH[location.hash];
    if (t) setTab(t);
  }, [location.hash]);

  const goToTab = (k) => {
    setTab(k);
    navigate({ pathname: '/updates', search: location.search, hash: k }, { replace: true });
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Updates Center</h1>
        <p>Announcements, schedules and downloadable documents targeted to your industry (park/type).</p>
      </div>

      <div className="filters" style={{ gap: 10 }}>
        {[
          ['announcements', `Announcements (${ann.length})`],
          ['schedule', `Schedule (${sch.length})`],
          ['documents', `Documents (${docs.length})`],
        ].map(([k, label]) => (
          <button
            key={k}
            type="button"
            className={`btn btn-sm ${tab === k ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => goToTab(k)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'announcements' && (
        <div className="card">
          <div className="section-title">Announcements</div>
          {ann.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📣</div><p>No announcements yet.</p></div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {ann.map((a) => (
                <div key={a._id} style={{ border: '1px solid var(--border)', borderRadius: 14, padding: 16, background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 900, fontFamily: 'var(--font-head)', flex: '1 1 200px' }}>{a.title}</div>
                    <span className={`badge ${a.priority === 'high' ? 'badge-danger' : a.priority === 'low' ? 'badge-muted' : 'badge-info'}`}>{a.priority}</span>
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <span className="badge badge-info">{ANNOUNCEMENT_TYPE_LABEL[a.announcementType] || 'General Notice'}</span>
                    {a.effectiveDate ? (
                      <span className="badge badge-muted">Effective {new Date(a.effectiveDate).toLocaleDateString()}</span>
                    ) : null}
                  </div>
                  <div style={{ marginTop: 8, fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
                    {a.message}
                  </div>
                  <div style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--text-muted)', opacity: 0.85 }}>
                    Posted: {a.createdAt ? new Date(a.createdAt).toLocaleString() : '—'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'schedule' && (
        <div className="card">
          <div className="section-title">Schedule</div>
          {sch.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📅</div><p>No schedule items yet.</p></div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {sch.map((i) => (
                <div key={i._id} style={{ border: '1px solid var(--border)', borderRadius: 14, padding: 16, background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 900, fontFamily: 'var(--font-head)' }}>{i.title}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className={`badge ${scheduleTypeBadgeClass(i.type)}`}>{displayScheduleType(i.type)}</span>
                      <span className={`badge ${scheduleEventStatusBadgeClass(i.eventStatus)}`}>
                        {scheduleEventStatusLabel(i.eventStatus)}
                      </span>
                    </div>
                  </div>
                  <div style={{ marginTop: 8, fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                    {i.date ? new Date(i.date).toLocaleString() : '—'}
                  </div>
                  {i.location ? (
                    <div style={{ marginTop: 6, fontSize: '0.86rem', color: 'var(--text)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Location:</span> {i.location}
                    </div>
                  ) : null}
                  {i.reminder24h ? (
                    <div style={{ marginTop: 6, fontSize: '0.78rem', color: 'var(--accent)' }}>
                      Reminder (24 hrs before) — please plan accordingly.
                    </div>
                  ) : null}
                  {i.description ? (
                    <div style={{ marginTop: 8, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
                      {i.description}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'documents' && (
        <div className="card">
          <div className="section-title">Documents</div>
          {docs.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📄</div><p>No documents available.</p></div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {docs.map((d) => (
                <div key={d._id} style={{ border: '1px solid var(--border)', borderRadius: 14, padding: 16, background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 900, fontFamily: 'var(--font-head)' }}>{d.title}</div>
                    <span className="badge badge-info">{displayDocumentCategory(d.category)}</span>
                  </div>
                  {d.versionYear ? (
                    <div style={{ marginTop: 8, fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                      Version / Year: <span style={{ color: 'var(--text)' }}>{d.versionYear}</span>
                    </div>
                  ) : null}
                  {d.description ? (
                    <div style={{ marginTop: 8, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
                      {d.description}
                    </div>
                  ) : null}
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Downloaded {Number(d.downloadCount) || 0} times
                    </span>
                    <a className="btn btn-secondary btn-sm" href={downloadMyDocumentUrl(d._id)} target="_blank" rel="noreferrer">Download</a>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {d.file?.originalName || '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

