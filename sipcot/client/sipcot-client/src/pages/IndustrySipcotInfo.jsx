import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function IndustrySipcotInfo() {
  const navigate = useNavigate();

  return (
    <div className="fade-in sipcot-info-page sipcot-about-page">
      {/* Hero — split layout, practical focus */}
      <section className="sipcot-about-hero-v2">
        <div className="sipcot-about-hero-bg" aria-hidden />
        <div className="sipcot-about-hero-grid">
          <div className="sipcot-about-hero-main">
            <p className="sipcot-about-eyebrow">Industry · About SIPCOT</p>
            <h1 className="sipcot-about-title">
              Manage your industry profile, returns and updates in one place
            </h1>
            <p className="sipcot-about-hook">
              SIPCOT develops and manages industrial areas in Tamil Nadu: plots, roads, power/water access, and cluster planning so factories can scale with fewer ad-hoc fixes.
              This portal is your <strong>operational desk</strong> for filing periodic numbers and reading what applies to <em>your park and sector</em>—not a textbook chapter.
            </p>
            <div className="sipcot-about-chip-row">
              <span className="sipcot-about-chip">Profile → correct targeting</span>
              <span className="sipcot-about-chip">Quarterly / annual returns</span>
              <span className="sipcot-about-chip">Admin review &amp; remarks</span>
              <span className="sipcot-about-chip">Circulars &amp; inspections</span>
            </div>
            <div className="sipcot-about-actions">
              <button type="button" className="btn btn-primary" onClick={() => navigate('/data/submit')}>
                Submit data
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/updates')}>
                Updates center
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/industry')}>
                My Industry
              </button>
            </div>
          </div>
          <aside className="sipcot-about-aside-card">
            <div className="sipcot-about-aside-kicker">In practice (this system)</div>
            <ul className="sipcot-about-aside-list">
              <li>
                <strong>One login → one unit.</strong> Complete <strong>My Industry</strong> so announcements and PDFs match your SIPCOT park and type.
              </li>
              <li>
                <strong>File returns like MIS.</strong> Same quarter/year as your internal MIS — tie to EB, payroll, and books before you click submit.
              </li>
              <li>
                <strong>Track decisions.</strong> <strong>My Submissions</strong> shows approved/rejected and remarks — fix data, don’t argue with the field.
              </li>
              <li>
                <strong>Match the record.</strong> Ensure submitted data matches statutory and internal records (EB, payroll, audit) before you submit.
              </li>
            </ul>
            <p className="sipcot-about-aside-demo">
              Academic demo: mirrors “decision support” dashboards for evaluators — not an official Government of Tamil Nadu service.
            </p>
          </aside>
        </div>
      </section>

      {/* Jump metrics */}
      <section className="sipcot-about-metrics-v2" aria-label="Quick guides">
        {[
          { step: 1, v: 'Quarterly / Annual', l: 'When & what to file', to: '/guide/submission-cycle' },
          { step: 2, v: 'Park / Type', l: 'Why targeting matters', to: '/guide/targeting' },
          { step: 3, v: 'Review flow', l: 'Submitted → Approved', to: '/guide/workflow' },
          { step: 4, v: 'Downloads', l: 'Forms & circulars', to: '/guide/downloads' },
        ].map((m) => (
          <button
            key={m.to}
            type="button"
            className="sipcot-about-metric-btn"
            onClick={() => navigate(m.to)}
            title={m.l}
          >
            <span className="sipcot-about-metric-num" aria-hidden>
              {String(m.step).padStart(2, '0')}
            </span>
            <span className="sipcot-about-metric-val">{m.v}</span>
            <span className="sipcot-about-metric-lbl">{m.l}</span>
          </button>
        ))}
      </section>

      {/* Context band — tighter copy */}
      <section className="sipcot-about-section sipcot-about-snapshot card">
        <header className="sipcot-about-section-head">
          <span className="sipcot-about-section-icon" aria-hidden>🗺️</span>
          <div>
            <h2 className="sipcot-about-h2">Tamil Nadu clusters — quick context</h2>
            <p className="sipcot-about-section-sub">
              From Chennai–Tiruvallur belts to Coimbatore–Tiruppur engineering &amp; textiles, southern corridors, and coastal logistics — units sit in <strong>defined estates</strong>, not scattered plots alone.
              SIPCOT-style development bundles land zoning with trunk roads and utilities where planned. Labels below are <strong>demo framing</strong>, not official statistics.
            </p>
          </div>
        </header>
        <div className="sipcot-about-stat-grid">
          {[
            ['Clusters', 'MSME to large units; mixed sectors in estate plots.'],
            ['Infrastructure', 'Internal roads, power/water headers, sometimes effluent mains.'],
            ['Workforce', 'Returns capture headcount splits for estate-level employment views.'],
            ['Intensity', 'Water/power per sector scale — flags outliers for review.'],
          ].map(([title, desc]) => (
            <div key={title} className="sipcot-about-stat sipcot-about-stat--elevated">
              <div className="sipcot-about-stat-val">{title}</div>
              <div className="sipcot-about-stat-desc">{desc}</div>
            </div>
          ))}
        </div>
        <p className="sipcot-about-note">
          College project disclaimer: illustrative narrative only — always follow PCB consent, Factory licence, labour law registers, and official TN portals for real compliance.
        </p>
      </section>

      {/* Three pillars */}
      <section className="sipcot-about-pillars">
        {[
          ['🏭', 'Estate & allotment', 'Your profile pins you to a park and shed/plot story — same as answering “which estate?” in a physical file.'],
          ['📊', 'Growth & reinvestment', 'Capex and turnover trends show whether your unit is expanding or stabilising — helps estate-level dashboards in this demo.'],
          ['💧', 'Resources & compliance', 'Water and power fields align with how you actually run STP/ETP and EB meters — not checkbox fiction.'],
        ].map(([icon, t, b]) => (
          <article key={t} className="sipcot-about-pillar">
            <span className="sipcot-about-pillar-icon" aria-hidden>{icon}</span>
            <h3 className="sipcot-about-pillar-title">{t}</h3>
            <p className="sipcot-about-pillar-body">{b}</p>
          </article>
        ))}
      </section>

      {/* Realistic scenarios — breaks “pure theory” */}
      <section className="sipcot-about-scenarios">
        <h2 className="sipcot-about-h2 sipcot-about-h2--center">Typical situations (not abstract theory)</h2>
        <p className="sipcot-about-scenarios-label" style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          Example scenarios for demonstration — your park and dates will differ.
        </p>
        <div className="sipcot-about-scenario-grid">
          <article className="sipcot-about-scenario">
            <span className="sipcot-about-scenario-tag">Example scenario</span>
            <h3>Estate circular — only some units</h3>
            <p>
              Admin posts an announcement for <strong>one SIPCOT park</strong> about a drainage shutdown weekend. If your <strong>My Industry</strong> park is wrong, you will not see it — fix the profile, refresh <strong>Updates</strong>.
            </p>
          </article>
          <article className="sipcot-about-scenario">
            <span className="sipcot-about-scenario-tag">Example scenario</span>
            <h3>Quarter-end filing</h3>
            <p>
              Finance closes Q3; HR locks headcount; you export EB units from the feeder. You enter the same window in <strong>Submit Data</strong> — totals match muster rolls, not a guess typed at midnight.
            </p>
          </article>
          <article className="sipcot-about-scenario">
            <span className="sipcot-about-scenario-tag">Example scenario</span>
            <h3>Rejected return</h3>
            <p>
              Admin remarks: “Male + female ≠ total employment.” You open <strong>My Submissions</strong>, correct the row, resubmit — same as fixing a GST line item before filing.
            </p>
          </article>
        </div>
      </section>

      {/* Data domains — bento */}
      <section className="card sipcot-about-capture-block">
        <header className="sipcot-about-section-head">
          <span className="sipcot-about-section-icon" aria-hidden>📋</span>
          <div>
            <h2 className="sipcot-about-h2">What each return is meant to reflect</h2>
            <p className="sipcot-about-section-sub">
              Each field should match your internal records and supporting documents.
              Think “fields you can defend in a review” — aligned with evidence you already produce for audit, PCB, or management — not filler text for the website.
              Choose a topic below for the full guide on that domain.
            </p>
          </div>
        </header>
        <div className="sipcot-about-domain-grid">
          {[
            {
              slug: 'economic',
              step: 1,
              h: 'Investment & turnover',
              body: 'Investment additions, turnover — same FY/Q as your books.',
            },
            {
              slug: 'people',
              step: 2,
              h: 'Workforce & skills',
              body: 'Headcount & splits — tie to payroll / muster.',
            },
            {
              slug: 'water',
              step: 3,
              h: 'Water use & sourcing',
              body: 'Sources & meters — traceable to consent / logs.',
            },
            {
              slug: 'power',
              step: 4,
              h: 'Energy & electricity',
              body: 'kWh & load — traceable to EB or EMS.',
            },
            {
              slug: 'environment',
              step: 5,
              h: 'Environmental compliance',
              body: 'ETP/STP/RWH/solar — matches running plant.',
            },
            {
              slug: 'csr',
              step: 6,
              h: 'CSR programmes & reporting',
              body: 'Programme lines vs total — matches board CSR reporting.',
            },
          ].map(({ slug, step, h, body }) => (
            <button
              key={slug}
              type="button"
              className="sipcot-about-domain sipcot-about-domain--interactive"
              onClick={() => navigate(`/guide/returns/${slug}`)}
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

      <div className="sipcot-about-features-4">
        <div className="sipcot-info-panel sipcot-about-panel-accent">
          <h3><span className="sipcot-about-diamond" aria-hidden /> Why estates collect MIS</h3>
          <p className="sipcot-about-panel-text">
            Comparable numbers across parks: where investment sticks, where jobs stall, where water or power per unit looks off versus peers — so meetings use charts, not only anecdotes.
          </p>
        </div>
        <div className="sipcot-info-panel">
          <h3><span className="sipcot-about-diamond" aria-hidden /> Your unit lifecycle</h3>
          <ol className="sipcot-info-steps" style={{ marginTop: 8 }}>
            <li>
              <strong>Commissioning</strong>
              <span>Plot/shed on record; <strong>My Industry</strong> matches allotment &amp; approvals stack.</span>
            </li>
            <li>
              <strong>Routine ops</strong>
              <span><strong>Submit Data</strong> each quarter/year with internal sign-off.</span>
            </li>
            <li>
              <strong>Review</strong>
              <span>Remarks in <strong>My Submissions</strong>; inspections from <strong>Schedule</strong>.</span>
            </li>
            <li>
              <strong>Change</strong>
              <span>Expansion or new contact → update profile before the next jump in numbers.</span>
            </li>
          </ol>
        </div>
      </div>

      <div className="sipcot-info-grid-2">
        <div className="sipcot-info-panel">
          <h3><span className="sipcot-about-diamond" aria-hidden /> Your responsibilities</h3>
          <ul className="sipcot-info-list sipcot-info-list--compact">
            <li>
              <strong style={{ color: 'var(--text)' }}>Keep profile accurate</strong> — park, plot/unit, sector/type, contacts; update when capacity or operations change.
            </li>
            <li>
              <strong style={{ color: 'var(--text)' }}>Submit within deadlines</strong> — follow circulars and reporting windows; avoid placeholder figures at the last minute.
            </li>
            <li>
              <strong style={{ color: 'var(--text)' }}>Ensure data consistency</strong> — totals align with payroll, EB, utilities, and books; sharp swings need a short internal check before upload.
            </li>
            <li>
              <strong style={{ color: 'var(--text)' }}>Maintain supporting documents</strong> — keep evidence ready (audit summaries, registers, EMS/EB extracts) for the same period.
            </li>
            <li>
              Read <strong style={{ color: 'var(--text)' }}>Updates</strong> for announcements and schedule — inspections and data drives apply to your park/type.
            </li>
          </ul>
        </div>
        <div className="sipcot-info-panel">
          <h3><span className="sipcot-about-diamond" aria-hidden /> After you submit</h3>
          <ul className="sipcot-info-list">
            <li>
              Status <strong style={{ color: 'var(--text)' }}>Submitted</strong> with timestamp — <strong style={{ color: 'var(--text)' }}>My Submissions</strong> is your proof of filing.
            </li>
            <li>
              Queued for admin; busy periods may batch by park or risk flags.
            </li>
            <li>
              <strong style={{ color: 'var(--text)' }}>Under Review</strong> — arithmetic and sanity checks vs your profile.
            </li>
            <li>
              <strong style={{ color: 'var(--text)' }}>Remarks</strong> — answer point by point; correct same reporting period unless told otherwise.
            </li>
            <li>
              <strong style={{ color: 'var(--text)' }}>Approved</strong> — rolls into estate aggregates and dashboards.
            </li>
            <li>
              <strong style={{ color: 'var(--text)' }}>Rejected</strong> — visible with reasons; fix and resubmit; avoid silent duplicate periods.
            </li>
            <li>
              Even with email/SMS later, confirm status here — portal wins.
            </li>
          </ul>
        </div>
      </div>

      <div className="sipcot-info-grid-2">
        <div className="sipcot-info-panel">
          <h3><span className="sipcot-about-diamond" aria-hidden /> Typical fields (what reviewers expect)</h3>
          <ul className="sipcot-info-list">
            <li><strong style={{ color: 'var(--text)' }}>Capex / investment:</strong> P&amp;M adds, expansion — same currency &amp; period as accounts.</li>
            <li><strong style={{ color: 'var(--text)' }}>Turnover:</strong> aligns with audited or management-approved figures for that quarter/year.</li>
            <li><strong style={{ color: 'var(--text)' }}>Employment:</strong> total + male/female + skilled split; locals if policy asks.</li>
            <li><strong style={{ color: 'var(--text)' }}>Water:</strong> borewell/metro/tanker, meters, reuse % vs consent.</li>
            <li><strong style={{ color: 'var(--text)' }}>Power:</strong> kWh, contract demand, renewable if metered separately.</li>
            <li><strong style={{ color: 'var(--text)' }}>Environment flags:</strong> ETP/STP/RWH/solar — match site reality.</li>
            <li><strong style={{ color: 'var(--text)' }}>CSR:</strong> lines sum to declared total; geography &amp; beneficiaries credible.</li>
            <li>Keep sanction letters / ERP exports offline to defend numbers in a real review.</li>
          </ul>
        </div>
        <div className="sipcot-info-panel">
          <h3><span className="sipcot-about-diamond" aria-hidden /> Common rejection triggers</h3>
          <ul className="sipcot-info-list">
            <li>Blank fields or wrong year/quarter; duplicate active record for same period.</li>
            <li>
              Mismatch between total employment and sub-category counts (male / female / skilled) — totals must reconcile.
            </li>
            <li>Turnover/capex jumps with no link to headcount or utilities — looks like paste error.</li>
            <li>Lakh/crore or decimal slip vs last submission.</li>
            <li>Water/power intensity absurd for sector scale until explained.</li>
            <li>CSR lines don’t add up; narrative vs numbers clash.</li>
            <li>Profile park/type inconsistent with figures (wrong cluster story).</li>
            <li>Placeholder magic numbers (“999999”) — auditors will bounce it.</li>
          </ul>
        </div>
      </div>

      <section className="card sipcot-about-walk-card">
        <header className="sipcot-about-section-head">
          <span className="sipcot-about-section-icon" aria-hidden>🚶</span>
          <div>
            <h2 className="sipcot-about-h2">How to use this portal</h2>
            <p className="sipcot-about-section-sub">
              Follow the steps below for a focused walkthrough — short pages instead of one long document. Each card opens a guided screen.
            </p>
          </div>
        </header>
        <div className="sipcot-walk-tiles">
          {[
            { num: 1, slug: 'my-industry', title: 'My Industry', blurb: 'Park, type, contacts — identity of your unit.', motion: 'Slide from left' },
            { num: 2, slug: 'submit-data', title: 'Submit Data', blurb: 'Returns & preparation checklist.', motion: 'Slide from right' },
            { num: 3, slug: 'my-submissions', title: 'My Submissions', blurb: 'Statuses & remarks trail.', motion: 'Slide from left' },
            { num: 4, slug: 'updates', title: 'Updates', blurb: 'Announcements, schedule, files.', motion: 'Slide from right' },
          ].map((t) => (
            <button
              key={t.slug}
              type="button"
              className="sipcot-walk-tile"
              onClick={() => navigate(`/guide/walkthrough/${t.slug}`)}
            >
              <span className="sipcot-walk-tile-num">{t.num}</span>
              <span className="sipcot-walk-tile-title">{t.title}</span>
              <span className="sipcot-walk-tile-blurb">{t.blurb}</span>
              <span className="sipcot-walk-tile-motion">{t.motion}</span>
              <span className="sipcot-walk-tile-cta">Open →</span>
            </button>
          ))}
        </div>
      </section>

      <section className="sipcot-about-faq-section card">
        <h2 className="sipcot-about-h2 sipcot-about-h2--center" style={{ marginBottom: 20 }}>
          FAQ — short answers
        </h2>
        <div className="sipcot-about-faq-grid">
          {[
            ['Why don’t I see some announcements?', 'Targeting by park/type — fix My Industry.'],
            ['Where do I download documents?', 'Updates Center → Documents.'],
            ['Is data live?', 'Dashboards poll on refresh (near real-time demo).'],
            ['First login?', 'Complete My Industry, then submit & watch Updates.'],
            ['How often to submit?', 'Per circular / Q1–Q4 / annual — follow Updates.'],
            ['Still pending?', 'Review takes time; check remarks.'],
            ['Rejected?', 'Read remarks; fix numbers; resubmit with consistent totals.'],
            [
              'Can I edit submitted data?',
              'Not while it is approved. You can correct and resubmit after rejection or when admin remarks ask for changes — check My Submissions.',
            ],
            ['Download fails?', 'Wrong park/type filter or file archived — check profile.'],
            ['Inspection date?', 'Updates → Schedule.'],
            ['Change park later?', 'Yes — updates who gets targeted content.'],
            ['What does admin see?', 'Your submissions for review & analytics — no dummy finals.'],
            ['Login blocked?', 'Account may be deactivated — ask admin.'],
          ].map(([q, a]) => (
            <div key={q} className="sipcot-about-faq-item">
              <div className="sipcot-about-faq-q">{q}</div>
              <div className="sipcot-about-faq-a">{a}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="sipcot-info-disclaimer" style={{ marginTop: 24 }}>
        <strong style={{ color: 'var(--warning)' }}>Disclaimer — </strong>
        This application is developed as an academic demonstration project based on SIPCOT-style industrial data management systems.
        It is not an official Government of Tamil Nadu platform. Use official TN portals and statutory channels for real compliance.
      </div>
    </div>
  );
}
