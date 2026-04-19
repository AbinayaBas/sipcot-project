import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function IndustryGuideDownloads() {
  const navigate = useNavigate();
  return (
    <div className="fade-in sipcot-info-page">
      <section className="sipcot-info-hero">
        <div className="sipcot-info-hero-inner">
          <p className="sipcot-info-kicker">Industry guide</p>
          <h1>Downloads (documents, circulars & forms)</h1>
          <p className="sipcot-info-hero-lead">
            Administrators can upload guidelines, circulars, SOPs and forms. You can download only the documents targeted to your industry (all/park/type).
          </p>
          <div className="sipcot-info-hero-actions">
            <button type="button" className="btn btn-primary" onClick={() => navigate('/updates')}>Open Updates Center</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/industry')}>Verify My Industry</button>
          </div>
        </div>
      </section>

      <div className="sipcot-info-grid-2">
        <div className="sipcot-info-panel">
          <h3><span style={{ opacity: 0.9 }}>◆</span> Where to download</h3>
          <p>
            Go to <strong style={{ color: 'var(--text)' }}>Updates Center → Documents</strong>.
            You’ll see document title, category (Guideline/Circular/Form), and a download button.
          </p>
        </div>
        <div className="sipcot-info-panel">
          <h3><span style={{ opacity: 0.9 }}>◆</span> Why you may not see a document</h3>
          <p>
            Documents can be targeted by park/type. Ensure your park/type is correct in <strong style={{ color: 'var(--text)' }}>My Industry</strong>.
            Archived documents are hidden unless admin re-enables them.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Categories (what they mean)</div>
        <div style={{ color: 'var(--text-muted)', lineHeight: 1.9 }}>
          <strong style={{ color: 'var(--text)' }}>Guideline</strong>: instructions / SOPs<br />
          <strong style={{ color: 'var(--text)' }}>Circular</strong>: official announcements / policy updates<br />
          <strong style={{ color: 'var(--text)' }}>Form</strong>: formats to be filled and submitted<br />
          <strong style={{ color: 'var(--text)' }}>Report</strong>: reference reports and summaries
        </div>
      </div>
    </div>
  );
}

