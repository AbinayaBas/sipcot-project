import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function IndustryGuideSubmissionCycle() {
  const navigate = useNavigate();
  return (
    <div className="fade-in sipcot-info-page">
      <section className="sipcot-info-hero">
        <div className="sipcot-info-hero-inner">
          <p className="sipcot-info-kicker">Industry guide</p>
          <h1>Quarterly / Annual submission cycle</h1>
          <p className="sipcot-info-hero-lead">
            In this portal, industries submit structured records either quarterly (Q1–Q4) or annually. Submissions help administrators track park-wise growth,
            employment, and resource usage trends.
          </p>
          <div className="sipcot-info-hero-actions">
            <button type="button" className="btn btn-primary" onClick={() => navigate('/data/submit')}>Submit data</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/data/my')}>My submissions</button>
          </div>
        </div>
      </section>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title">What you should submit</div>
        <div style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
          - Investment, turnover, exports (if applicable)<br />
          - Employment totals + breakup (male/female/skilled/unskilled/local)<br />
          - Water and power usage<br />
          - CSR totals and activities<br />
          - Compliance indicators (effluent treatment, rainwater harvesting, solar generation)
        </div>
      </div>

      <div className="sipcot-info-grid-2">
        <div className="sipcot-info-panel">
          <h3><span style={{ opacity: 0.9 }}>◆</span> Good practices</h3>
          <p>
            Keep internal records ready before submission. Double-check totals (employment breakup should match total).
            Avoid sudden spikes unless you can justify them in remarks or supporting documents.
          </p>
        </div>
        <div className="sipcot-info-panel">
          <h3><span style={{ opacity: 0.9 }}>◆</span> Deadlines & schedule</h3>
          <p>
            Administrators can publish deadlines and inspection schedules. Check <strong style={{ color: 'var(--text)' }}>Updates Center</strong> regularly.
          </p>
        </div>
      </div>
    </div>
  );
}

