import React from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { returnDomains } from '../data/returnDomains';

export default function IndustryReturnDomain() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const domain = returnDomains[slug];

  if (!domain) {
    return <Navigate to="/about-sipcot" replace />;
  }

  return (
    <div className="fade-in sipcot-about-page sipcot-return-domain-page">
      <section className="sipcot-return-domain-hero">
        <button type="button" className="sipcot-walk-back" onClick={() => navigate('/about-sipcot')}>
          ← Back to About SIPCOT
        </button>
        <span className="sipcot-return-domain-step" aria-hidden>
          {String(domain.step).padStart(2, '0')}
        </span>
        <p className="sipcot-about-eyebrow" style={{ marginBottom: 8 }}>{domain.kicker}</p>
        <h1 className="sipcot-about-title">{domain.title}</h1>
        <p className="sipcot-about-hook" style={{ maxWidth: 720 }}>{domain.lead}</p>
        <div className="sipcot-about-actions" style={{ marginTop: 18 }}>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/data/submit')}>
            Go to Submit Data
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/about-sipcot')}>
            All six domains
          </button>
        </div>
      </section>

      <div className="sipcot-return-domain-sections">
        {domain.sections.map((sec) => (
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
        Academic demo: wording is illustrative for your major project — align real compliance with PCB, Factories Act, and company law as applicable.
      </p>
    </div>
  );
}
