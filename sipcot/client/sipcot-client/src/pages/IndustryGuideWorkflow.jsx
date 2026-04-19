import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function IndustryGuideWorkflow() {
  const navigate = useNavigate();
  return (
    <div className="fade-in sipcot-info-page">
      <section className="sipcot-info-hero">
        <div className="sipcot-info-hero-inner">
          <p className="sipcot-info-kicker">Industry guide</p>
          <h1>Review workflow (Submitted → Approved)</h1>
          <p className="sipcot-info-hero-lead">
            After you submit a record, it goes through an administrative review workflow. This ensures quality and creates an audit trail for monitoring.
          </p>
          <div className="sipcot-info-hero-actions">
            <button type="button" className="btn btn-primary" onClick={() => navigate('/data/my')}>Track my submissions</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/data/submit')}>Submit again</button>
          </div>
        </div>
      </section>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title">Statuses explained</div>
        <div style={{ display: 'grid', gap: 12 }}>
          {[
            ['Draft', 'Saved but not submitted for admin review.'],
            ['Submitted', 'Sent to admin for review.'],
            ['Under Review', 'Admin is reviewing your record.'],
            ['Approved', 'Accepted and included in analytics & exports.'],
            ['Rejected', 'Needs correction. Admin remarks explain what to fix.'],
          ].map(([s, d]) => (
            <div key={s} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 14, background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ fontWeight: 900, fontFamily: 'var(--font-head)' }}>{s}</div>
              <div style={{ marginTop: 6, color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.9rem' }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="sipcot-info-grid-2">
        <div className="sipcot-info-panel">
          <h3><span style={{ opacity: 0.9 }}>◆</span> If rejected</h3>
          <p>
            Open <strong style={{ color: 'var(--text)' }}>My Submissions</strong>, read admin remarks, correct the record, and resubmit.
            Ensure totals are consistent and required fields are filled.
          </p>
        </div>
        <div className="sipcot-info-panel">
          <h3><span style={{ opacity: 0.9 }}>◆</span> Why this helps decision support</h3>
          <p>
            Approved records are used in analytics dashboards (investment/employment trends). Review ensures data quality so decisions are based on consistent inputs.
          </p>
        </div>
      </div>
    </div>
  );
}

