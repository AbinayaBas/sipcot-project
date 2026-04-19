import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function IndustryGuideTargeting() {
  const navigate = useNavigate();
  return (
    <div className="fade-in sipcot-info-page">
      <section className="sipcot-info-hero">
        <div className="sipcot-info-hero-inner">
          <p className="sipcot-info-kicker">Industry guide</p>
          <h1>Park / Type targeting (why it matters)</h1>
          <p className="sipcot-info-hero-lead">
            Announcements, schedule items and documents can be targeted based on your <strong style={{ color: 'var(--text)' }}>SIPCOT Park</strong> and
            <strong style={{ color: 'var(--text)' }}> Industry Type</strong>. This keeps updates relevant and reduces noise.
          </p>
          <div className="sipcot-info-hero-actions">
            <button type="button" className="btn btn-primary" onClick={() => navigate('/industry')}>Update My Industry</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/updates')}>Updates Center</button>
          </div>
        </div>
      </section>

      <div className="sipcot-info-grid-2">
        <div className="sipcot-info-panel">
          <h3><span style={{ opacity: 0.9 }}>◆</span> How targeting works</h3>
          <p>
            Admin can publish updates to:<br />
            - <strong style={{ color: 'var(--text)' }}>All industries</strong><br />
            - <strong style={{ color: 'var(--text)' }}>A specific park</strong> (example: Hosur I)<br />
            - <strong style={{ color: 'var(--text)' }}>A specific industry type</strong> (example: Manufacturing)
          </p>
        </div>
        <div className="sipcot-info-panel">
          <h3><span style={{ opacity: 0.9 }}>◆</span> Common issue</h3>
          <p>
            If your park/type is missing or incorrect in <strong style={{ color: 'var(--text)' }}>My Industry</strong>, you may not receive
            park/type-specific circulars. Keep profile details accurate.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Quick checklist</div>
        <ol className="sipcot-info-steps">
          <li><strong>Open My Industry</strong><span>Verify park, type, category, contacts.</span></li>
          <li><strong>Save updates</strong><span>Ensure profile is saved after edits.</span></li>
          <li><strong>Check Updates Center</strong><span>Announcements, schedule and documents will be filtered accordingly.</span></li>
        </ol>
      </div>
    </div>
  );
}

