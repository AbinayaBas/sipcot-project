import React from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { walkthroughSteps } from '../data/walkthroughSteps';

export default function IndustryWalkthroughStep() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const step = walkthroughSteps[slug];

  if (!step) {
    return <Navigate to="/about-sipcot" replace />;
  }

  const animClass = step.slide === 'rtl' ? 'sipcot-walk-detail--rtl' : 'sipcot-walk-detail--ltr';

  return (
    <div className={`sipcot-walk-detail-page fade-in ${animClass}`}>
      <section className="sipcot-walk-detail-hero">
        <button type="button" className="sipcot-walk-back" onClick={() => navigate('/about-sipcot')}>
          ← Back to About SIPCOT
        </button>
        <p className="sipcot-info-kicker">{step.kicker}</p>
        <h1>{step.title}</h1>
        <p className="sipcot-walk-detail-lead">{step.lead}</p>
        <div className="sipcot-walk-detail-actions">
          <button type="button" className="btn btn-primary" onClick={() => navigate(step.primaryCta.to)}>
            {step.primaryCta.label}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/about-sipcot')}>
            Walkthrough overview
          </button>
        </div>
      </section>

      <div className="sipcot-walk-detail-body">
        {step.sections.map((sec) => (
          <article
            key={sec.label}
            className="sipcot-walk-detail-section card"
          >
            <div className="sipcot-walk-label" style={{ marginTop: 0 }}>
              {sec.label}
            </div>
            {sec.paragraphs?.map((p, i) => (
              <p key={`${sec.label}-p-${i}`} className="sipcot-walk-text" style={{ marginTop: 10 }}>
                {p}
              </p>
            ))}
            {sec.bullets?.length ? (
              <ul className="sipcot-walk-list" style={{ marginTop: 12 }}>
                {sec.bullets.map((b, i) => (
                  <li key={`${sec.label}-b-${i}`}>{b}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
