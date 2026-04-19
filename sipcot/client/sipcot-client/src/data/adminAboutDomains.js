/**
 * Admin About — detail pages for /admin/guide/review/:slug
 */
export const ADMIN_ABOUT_SLUGS = [
  'dashboard-insights',
  'records-review',
  'industries-registry',
  'content-publishing',
  'users-governance',
  'exports-reporting',
];

export const adminAboutDomains = {
  'dashboard-insights': {
    step: 1,
    title: 'Monitoring & Dashboards',
    kicker: 'Admin · Dashboard intelligence',
    lead:
      'The dashboard is your single-screen pulse: aggregates refresh on a short interval while you stay logged in, so you see near–real-time movement—not a monthly PDF snapshot.',
    sections: [
      {
        heading: 'What you use it for',
        bullets: [
          'Scan totals for submissions, approvals, industries, and park-wise flavour before drilling into lists.',
          'Read decision-support panels: alerts (e.g. overdue reviews, concentration risk) and plain-language recommendations.',
          'Inspect “top flagged” style rows where rule-based risk scores surface outliers for human follow-up.',
        ],
      },
      {
        heading: 'Good practice (demo)',
        paragraphs: [
          'Treat alerts as triage cues, not automatic verdicts — open Data Records or Industries for context before messaging a unit.',
        ],
      },
      {
        heading: 'Quick actions from here',
        bullets: [
          'Use stat cards where wired to jump to Industries, Records, or Users — fewer clicks during a viva demo.',
        ],
      },
    ],
  },
  'records-review': {
    step: 2,
    title: 'Reviews & Approvals',
    kicker: 'Admin · Data records',
    lead:
      'Industry filings land here as structured rows: filter by year, quarter, park, status — then approve or reject with remarks that the unit sees on their portal.',
    sections: [
      {
        heading: 'Reviewer checklist mindset',
        bullets: [
          'Arithmetic: employment splits vs totals; CSR lines vs aggregate; obvious unit-scale slips.',
          'Consistency: spike vs unit profile and prior periods — ask for clarification in remarks rather than guessing.',
          'Traceability: each decision should make sense when read beside admin remarks history.',
        ],
      },
      {
        heading: 'Statuses you drive',
        bullets: [
          'Submitted → Under Review → Approved / Rejected (conceptually — exact labels follow your seeded data).',
          'Rejected stays visible with remarks so units can correct and resubmit.',
        ],
      },
      {
        heading: 'Evaluator tip',
        paragraphs: [
          'During presentation, filter to one park and walk one row from open to approved/rejected — that proves workflow understanding.',
        ],
      },
    ],
  },
  'industries-registry': {
    step: 3,
    title: 'Industry Directory',
    kicker: 'Admin · Industry records',
    lead:
      'This is the authoritative list of registered units in the demo: park, sector type, category, location, registration — aligned to how announcements and documents target audiences.',
    sections: [
      {
        heading: 'Why it matters upstream',
        bullets: [
          'Wrong park/type on a profile breaks targeting — industries miss circulars you publish under Content.',
          'Filters let you brief stakeholders: “Show me all Active / Chemical / Hosur II” for a walking tour.',
        ],
      },
      {
        heading: 'Operational habit',
        paragraphs: [
          'When seed data is refreshed, skim for duplicate registrations or inconsistent spellings — keeps analytics trustworthy.',
        ],
      },
    ],
  },
  'content-publishing': {
    step: 4,
    title: 'Communications Hub',
    kicker: 'Admin · Communications',
    lead:
      'Three lanes: Announcements (notices), Schedule (inspections/deadlines/meetings), Documents (PDFs/forms). Each can target all industries, a single park, or a sector type.',
    sections: [
      {
        heading: 'Publishing discipline',
        bullets: [
          'Pick audience deliberately — estate-specific shutdowns should not blast every park.',
          'Keep schedule dates realistic for the demo storyline; archive items when superseded.',
          'Upload documents with clear titles so industry users recognise them in Updates.',
        ],
      },
      {
        heading: 'What industries experience',
        paragraphs: [
          'Their Updates Center only shows active items they qualify for — so your targeting choices directly affect perceived “service quality” of the portal.',
        ],
      },
    ],
  },
  'users-governance': {
    step: 5,
    title: 'Access & Accounts',
    kicker: 'Admin · Accounts',
    lead:
      'Industry accounts tie one login to one industry profile. You can activate or deactivate industry users — deactivated accounts cannot log in or hit protected APIs.',
    sections: [
      {
        heading: 'When to deactivate (conceptually)',
        bullets: [
          'Unit closed / long dormancy / credential compromise — in production you would follow organisational policy.',
          'Always communicate outside the app if real users depended on this system.',
        ],
      },
      {
        heading: 'Separation of roles',
        paragraphs: [
          'Admin routes require admin JWT; industry cannot open /admin URLs — demonstrate that during evaluation.',
        ],
      },
    ],
  },
  'exports-reporting': {
    step: 6,
    title: 'MIS Export & Reporting',
    kicker: 'Admin · Reporting',
    lead:
      'Export pulls approved structured records into a spreadsheet-friendly format so you can analyse offline or attach slides for review meetings — in this demo it validates end-to-end data usability.',
    sections: [
      {
        heading: 'Expectations',
        bullets: [
          'Typically filtered to approved rows — aligns with “trusted” MIS for aggregation.',
          'Large estates would schedule exports; here it is manual for demonstration.',
        ],
      },
      {
        heading: 'Story for your project title',
        paragraphs: [
          'Pair live dashboard charts with a one-time export during the demo to show both interactive analytics and portable reporting — “intelligent decision support” end-to-end.',
        ],
      },
    ],
  },
};
