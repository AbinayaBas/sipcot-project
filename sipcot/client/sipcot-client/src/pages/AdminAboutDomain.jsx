import React from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { adminAboutDomains } from '../data/adminAboutDomains';

export default function AdminAboutDomain() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const domain = adminAboutDomains[slug];

  if (!domain) {
    return <Navigate to="/admin/about-sipcot" replace />;
  }

  const cta =
    slug === 'dashboard-insights'
      ? { label: 'Open dashboard', to: '/admin/dashboard' }
      : slug === 'records-review'
        ? { label: 'Open data records', to: '/admin/records' }
        : slug === 'industries-registry'
          ? { label: 'Open industries', to: '/admin/industries' }
          : slug === 'content-publishing'
            ? { label: 'Announcements', to: '/admin/announcements' }
            : slug === 'users-governance'
              ? { label: 'Users', to: '/admin/users' }
              : { label: 'Export report', to: '/admin/export' };

  return (
    <div className="fade-in sipcot-about-page sipcot-return-domain-page">
      <section className="sipcot-return-domain-hero">
        <button type="button" className="sipcot-walk-back" onClick={() => navigate('/admin/about-sipcot')}>
          ← Back to About (admin)
        </button>
        <span className="sipcot-return-domain-step" aria-hidden>
          {String(domain.step).padStart(2, '0')}
        </span>
        <p className="sipcot-about-eyebrow" style={{ marginBottom: 8 }}>{domain.kicker}</p>
        <h1 className="sipcot-about-title">{domain.title}</h1>
        <p className="sipcot-about-hook" style={{ maxWidth: 720 }}>{domain.lead}</p>
        <div className="sipcot-about-actions" style={{ marginTop: 18 }}>
          <button type="button" className="btn btn-primary" onClick={() => navigate(cta.to)}>
            {cta.label}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/about-sipcot')}>
            All six admin areas
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
        Student demo — align any real-world process with your institution and official SIPCOT / government channels if beyond coursework.
      </p>
    </div>
  );
}
