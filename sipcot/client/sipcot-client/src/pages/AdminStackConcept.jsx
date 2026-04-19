import React from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { adminStackConcepts } from '../data/adminStackConcepts';

export default function AdminStackConcept() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const concept = adminStackConcepts[slug];

  if (!concept) {
    return <Navigate to="/admin/about-sipcot" replace />;
  }

  const { primaryCta } = concept;

  return (
    <div className="fade-in sipcot-about-page sipcot-return-domain-page">
      <section className="sipcot-return-domain-hero">
        <button type="button" className="sipcot-walk-back" onClick={() => navigate('/admin/about-sipcot')}>
          ← Back to About (admin)
        </button>
        <span className="sipcot-return-domain-step" aria-hidden>
          {String(concept.step).padStart(2, '0')}
        </span>
        <p className="sipcot-about-eyebrow" style={{ marginBottom: 8 }}>{concept.kicker}</p>
        <h1 className="sipcot-about-title">{concept.title}</h1>
        <p className="sipcot-about-hook" style={{ maxWidth: 720 }}>{concept.lead}</p>
        <div className="sipcot-about-actions" style={{ marginTop: 18 }}>
          <button type="button" className="btn btn-primary" onClick={() => navigate(primaryCta.to)}>
            {primaryCta.label}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/about-sipcot')}>
            All four themes
          </button>
        </div>
      </section>

      <div className="sipcot-return-domain-sections">
        {concept.sections.map((sec) => (
          <article key={sec.heading} className="card sipcot-return-domain-card">
            <h2 className="sipcot-return-domain-h2">{sec.heading}</h2>
            {sec.paragraphs?.map((p, i) => (
              <p key={`p-${i}`} className="sipcot-about-narrative" style={{ marginTop: i ? 12 : 0 }}>
                {p}
              </p>
            ))}
            {sec.bullets?.length ? (
              <ul className="sipcot-return-domain-ul">
                {sec.bullets.map((b, i) => (
                  <li key={`b-${i}`}>{b}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>

      <p className="sipcot-about-note" style={{ marginTop: 24, marginBottom: 0 }}>
        Student demo — illustrative framing for coursework, not an official government process specification.
      </p>
    </div>
  );
}
