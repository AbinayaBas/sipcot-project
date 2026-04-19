import React from 'react';
import { useNavigate } from 'react-router-dom';

const MENU_ROWS = [
  ['Dashboard', 'Displays KPIs, alerts, and real-time system insights'],
  ['Industries', 'Manages industry master data and filtering'],
  ['Data Records', 'Handles submission review and approval process'],
  ['Announcements', 'Publishes official communications'],
  ['Schedule', 'Manages timelines and important events'],
  ['Documents', 'Uploads and distributes official files'],
  ['Users', 'Controls account access and roles'],
  ['Export Reports', 'Generates downloadable reports'],
];

export default function AdminSipcotInfo() {
  const navigate = useNavigate();

  return (
    <div className="fade-in sipcot-info-page sipcot-about-page">
      <section className="sipcot-about-hero-v2">
        <div className="sipcot-about-hero-bg" aria-hidden />
        <div className="sipcot-about-hero-grid">
          <div className="sipcot-about-hero-main">
            <p className="sipcot-about-eyebrow">Administrator · About this portal</p>
            <h1 className="sipcot-about-title">Administrative Control &amp; Monitoring Portal</h1>
            <p className="sipcot-about-hook">
              This portal provides a centralized platform for managing and monitoring industrial data across State Industries Promotion Corporation of Tamil Nadu Industrial Parks.
              It enables administrators to review industry submissions, validate records, publish official communications, and manage user access in a structured and transparent manner.
            </p>
            <div className="sipcot-about-chip-row">
              <span className="sipcot-about-chip">Submission validation</span>
              <span className="sipcot-about-chip">Targeted communications</span>
              <span className="sipcot-about-chip">Role-based access</span>
              <span className="sipcot-about-chip">Central reporting</span>
            </div>
            <div className="sipcot-about-actions">
              <button type="button" className="btn btn-primary" onClick={() => navigate('/admin/dashboard')}>
                Dashboard
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/records')}>
                Data records
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/announcements')}>
                Announcements
              </button>
            </div>
          </div>
          <aside className="sipcot-about-aside-card admin-about-aside-functions">
            <div className="sipcot-about-aside-kicker">Administrative Functions in Practice</div>
            <div className="admin-about-function-block">
              <h3 className="admin-about-function-title">Data Validation &amp; Consolidation</h3>
              <p className="admin-about-function-body">
                Industry submissions are reviewed and verified before being included in dashboards and reports.
              </p>
            </div>
            <div className="admin-about-function-block">
              <h3 className="admin-about-function-title">Content Management</h3>
              <p className="admin-about-function-body">
                Announcements, schedules, and documents can be published and targeted to specific industrial parks or sectors.
              </p>
            </div>
            <div className="admin-about-function-block">
              <h3 className="admin-about-function-title">Access Control</h3>
              <p className="admin-about-function-body">
                User accounts are managed through secure role-based access, including activation and deactivation of industry users.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="sipcot-about-metrics-v2" aria-label="Jump to admin areas">
        {[
          { step: 1, v: 'Dashboard', l: 'KPIs & alerts', to: '/admin/dashboard' },
          { step: 2, v: 'Records', l: 'Review & approve', to: '/admin/records' },
          { step: 3, v: 'Industries', l: 'Directory', to: '/admin/industries' },
          { step: 4, v: 'Export', l: 'Reports', to: '/admin/export' },
        ].map((m) => (
          <button key={m.to} type="button" className="sipcot-about-metric-btn" onClick={() => navigate(m.to)} title={m.l}>
            <span className="sipcot-about-metric-num" aria-hidden>
              {String(m.step).padStart(2, '0')}
            </span>
            <span className="sipcot-about-metric-val">{m.v}</span>
            <span className="sipcot-about-metric-lbl">{m.l}</span>
          </button>
        ))}
      </section>

      <section className="sipcot-about-section sipcot-about-snapshot card">
        <header className="sipcot-about-section-head">
          <div>
            <h2 className="sipcot-about-h2">System Functional Overview</h2>
            <p className="sipcot-about-section-sub">
              The system integrates multiple administrative functions, including data aggregation, validation workflows, targeted communication, and access management,
              to ensure efficient industrial data governance.
            </p>
          </div>
        </header>
        <div className="sipcot-about-stat-grid">
          {[
            {
              slug: 'aggregation',
              step: 1,
              title: 'Aggregation',
              desc: 'Consolidates industrial data across parks and sectors for centralized monitoring and reporting.',
            },
            {
              slug: 'governance',
              step: 2,
              title: 'Governance',
              desc: 'Supports structured review, approval, and remark-based workflows for submitted records.',
            },
            {
              slug: 'targeting',
              step: 3,
              title: 'Targeting',
              desc: 'Ensures communications are delivered to the appropriate industries based on park or sector.',
            },
            {
              slug: 'controls',
              step: 4,
              title: 'Controls',
              desc: 'Manages user roles and permissions to maintain system security and operational control.',
            },
          ].map(({ slug, step, title, desc }) => (
            <button
              key={slug}
              type="button"
              className="sipcot-about-stat sipcot-about-stat--elevated sipcot-about-stat--interactive"
              onClick={() => navigate(`/admin/guide/stack/${slug}`)}
            >
              <span className="sipcot-about-stat-num" aria-hidden>{String(step).padStart(2, '0')}</span>
              <div className="sipcot-about-stat-val">{title}</div>
              <div className="sipcot-about-stat-desc">{desc}</div>
              <span className="sipcot-about-stat-cta">View detail</span>
            </button>
          ))}
        </div>
      </section>

      <section className="sipcot-about-pillars sipcot-about-pillars--plain">
        {[
          [
            'Analytics & Monitoring',
            'Provides charts, alerts, and insights based on submitted industrial data to support administrative decision-making.',
          ],
          [
            'Data Workflow Management',
            'Handles submission, review, approval, and rejection processes with proper tracking.',
          ],
          [
            'Communication Management',
            'Facilitates announcements, schedules, and document sharing with industries.',
          ],
        ].map(([t, b]) => (
          <article key={t} className="sipcot-about-pillar">
            <h3 className="sipcot-about-pillar-title">{t}</h3>
            <p className="sipcot-about-pillar-body">{b}</p>
          </article>
        ))}
      </section>

      <section className="card sipcot-about-lifecycle-section">
        <h2 className="sipcot-about-h2">Data Lifecycle within the System</h2>
        <ol className="sipcot-about-lifecycle-list">
          <li>
            <strong>Submission</strong> – Industries submit periodic operational data
          </li>
          <li>
            <strong>Validation</strong> – Data is reviewed for completeness and accuracy
          </li>
          <li>
            <strong>Approval / Rejection</strong> – Records are approved or returned with remarks
          </li>
          <li>
            <strong>Storage</strong> – Verified data is stored in the central database
          </li>
          <li>
            <strong>Reporting</strong> – Approved data is used for dashboards and exports
          </li>
        </ol>
      </section>

      <section className="card sipcot-about-capture-block">
        <header className="sipcot-about-section-head">
          <div>
            <h2 className="sipcot-about-h2">Administrative Responsibility Areas</h2>
            <p className="sipcot-about-section-sub">
              Each area links to a short guide aligned with your menus. Select a topic for a focused walk-through.
            </p>
          </div>
        </header>
        <div className="sipcot-about-domain-grid">
          {[
            {
              slug: 'dashboard-insights',
              step: 1,
              h: 'Monitoring & Dashboards',
              body: 'View KPIs, alerts, and system activity in real time',
            },
            {
              slug: 'records-review',
              step: 2,
              h: 'Reviews & Approvals',
              body: 'Approve or reject submissions with remarks',
            },
            {
              slug: 'industries-registry',
              step: 3,
              h: 'Industry Directory',
              body: 'Maintain and filter industry records',
            },
            {
              slug: 'content-publishing',
              step: 4,
              h: 'Communications Hub',
              body: 'Manage announcements, schedules, and documents',
            },
            {
              slug: 'users-governance',
              step: 5,
              h: 'Access & Accounts',
              body: 'Control user access and account status',
            },
            {
              slug: 'exports-reporting',
              step: 6,
              h: 'MIS Export & Reporting',
              body: 'Generate and download structured reports',
            },
          ].map(({ slug, step, h, body }) => (
            <button
              key={slug}
              type="button"
              className="sipcot-about-domain sipcot-about-domain--interactive"
              onClick={() => navigate(`/admin/guide/review/${slug}`)}
            >
              <span className="sipcot-about-domain-num" aria-hidden>
                {String(step).padStart(2, '0')}
              </span>
              <h5 className="sipcot-about-domain-title">{h}</h5>
              <p className="sipcot-about-domain-body">{body}</p>
              <span className="sipcot-about-domain-cta">View guide</span>
            </button>
          ))}
        </div>
      </section>

      <section className="admin-about-roles-section">
        <header className="admin-about-block-header">
          <h2 className="sipcot-about-h2 sipcot-about-block-title">System Roles &amp; Access Levels</h2>
          <p className="admin-about-block-lead">
            Access is enforced by authentication and role: administrators operate the monitoring and governance console; industry users interact only with unit-facing modules.
          </p>
        </header>
        <div className="admin-about-roles-grid">
          <article className="card admin-about-role-card admin-about-role-card--admin">
            <div className="admin-about-role-card-top">
              <h3 className="admin-about-role-ribbon admin-about-role-ribbon--admin">Administrator</h3>
              <span className="admin-about-role-route-hint">
                Role · <code>/admin/*</code> routes
              </span>
            </div>
            <p className="admin-about-role-scope">
              Full access to verification queues, publications, master industry data, and user lifecycle actions within this application.
            </p>
            <ul className="admin-about-role-checklist" aria-label="Administrator responsibilities">
              <li>Reviews and validates industry submissions</li>
              <li>Publishes announcements, schedules, and documents</li>
              <li>Manages users, activation status, and administrative visibility</li>
            </ul>
          </article>
          <article className="card admin-about-role-card admin-about-role-card--industry">
            <div className="admin-about-role-card-top">
              <h3 className="admin-about-role-ribbon admin-about-role-ribbon--industry">Industry User</h3>
              <span className="admin-about-role-route-hint">Role · industry menus only</span>
            </div>
            <p className="admin-about-role-scope">
              Scoped to one registered unit: filings, updates, and read-only visibility of notices and remarks relevant to that unit.
            </p>
            <ul className="admin-about-role-checklist" aria-label="Industry user responsibilities">
              <li>Submits and updates periodic operational data</li>
              <li>Reads announcements and downloads documents from Updates</li>
              <li>Tracks submission status and administrator remarks</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="card admin-about-demo-flow-panel" aria-labelledby="demo-flow-heading">
        <header className="admin-about-demo-flow-head">
          <div>
            <p className="admin-about-demo-flow-eyebrow">Demonstration sequence</p>
            <h2 id="demo-flow-heading" className="sipcot-about-h2 admin-about-demo-flow-title">
              Suggested System Usage Flow
            </h2>
            <p className="admin-about-demo-flow-intro">
              During evaluation or walk-through, follow this order so narrative matches how data moves from intake to reporting.
            </p>
          </div>
        </header>
        <ol className="admin-about-flow-steps">
          <li className="admin-about-flow-step">
            <span className="admin-about-flow-num" aria-hidden>
              01
            </span>
            <div className="admin-about-flow-body">
              <strong className="admin-about-flow-step-title">Dashboard</strong>
              <p className="admin-about-flow-step-desc">Scan KPIs, alerts, and live refresh — establish context before drilling into lists.</p>
              <span className="admin-about-flow-step-meta">Opens from sidebar · Dashboard</span>
            </div>
          </li>
          <li className="admin-about-flow-step">
            <span className="admin-about-flow-num" aria-hidden>
              02
            </span>
            <div className="admin-about-flow-body">
              <strong className="admin-about-flow-step-title">Data Records</strong>
              <p className="admin-about-flow-step-desc">Filter by status or park; approve or reject with remarks industries can see.</p>
              <span className="admin-about-flow-step-meta">Opens from sidebar · Data Records</span>
            </div>
          </li>
          <li className="admin-about-flow-step">
            <span className="admin-about-flow-num" aria-hidden>
              03
            </span>
            <div className="admin-about-flow-body">
              <strong className="admin-about-flow-step-title">Communications</strong>
              <p className="admin-about-flow-step-desc">Publish announcements or schedule items with park / sector targeting.</p>
              <span className="admin-about-flow-step-meta">Announcements · Schedule · Documents</span>
            </div>
          </li>
          <li className="admin-about-flow-step admin-about-flow-step--last">
            <span className="admin-about-flow-num" aria-hidden>
              04
            </span>
            <div className="admin-about-flow-body">
              <strong className="admin-about-flow-step-title">Export Reports</strong>
              <p className="admin-about-flow-step-desc">Download consolidated approved MIS for offline analysis or presentation slides.</p>
              <span className="admin-about-flow-step-meta">Opens from sidebar · Export Report</span>
            </div>
          </li>
        </ol>
      </section>

      <div className="card" style={{ padding: 0, marginBottom: 28, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(99,179,237,0.06)' }}>
          <div className="section-title" style={{ margin: 0 }}>
            Menu → responsibility
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 8, fontWeight: 300 }}>
            How each sidebar entry maps to administrative responsibility in this application.
          </p>
        </div>
        <div className="sipcot-info-table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ paddingLeft: 24 }}>Menu</th>
                <th style={{ paddingRight: 24 }}>Responsibility</th>
              </tr>
            </thead>
            <tbody>
              {MENU_ROWS.map(([menu, desc]) => (
                <tr key={menu}>
                  <td style={{ paddingLeft: 24 }}>{menu}</td>
                  <td style={{ paddingRight: 24, color: 'var(--text-muted)' }}>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <section className="sipcot-about-faq-section card">
        <h2 className="sipcot-about-h2 sipcot-about-h2--center" style={{ marginBottom: 20 }}>
          Frequently Asked Questions
        </h2>
        <div className="sipcot-about-faq-grid">
          {[
            ['Why do industries miss announcements?', 'Ensure announcements are correctly targeted based on park or sector.'],
            ['Where are admin remarks visible?', 'Remarks are displayed in the industry user’s submission view.'],
            ['Can industry users access admin dashboards?', 'No. Access is restricted based on user roles.'],
            ['What does deactivation do?', 'It disables login access until the account is reactivated.'],
          ].map(([q, a]) => (
            <div key={q} className="sipcot-about-faq-item">
              <div className="sipcot-about-faq-q">{q}</div>
              <div className="sipcot-about-faq-a">{a}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="card sipcot-about-integrity-section">
        <h2 className="sipcot-about-h2">Data Integrity &amp; Compliance</h2>
        <p className="sipcot-about-integrity-body">
          The system ensures that all submitted data undergoes validation before approval. Audit tracking, controlled access, and structured workflows help maintain accuracy, accountability, and transparency.
        </p>
      </section>

      <div className="sipcot-info-disclaimer" style={{ marginTop: 8 }}>
        <strong style={{ color: 'var(--warning)' }}>Disclaimer — </strong>
        This application is developed as an academic demonstration project based on SIPCOT-style industrial data management systems.
        It is not an official Government of Tamil Nadu platform.
      </div>
    </div>
  );
}
