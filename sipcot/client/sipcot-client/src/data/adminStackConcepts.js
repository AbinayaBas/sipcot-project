/**
 * Admin About — “What this admin stack represents” → /admin/guide/stack/:slug
 */
export const ADMIN_STACK_SLUGS = ['aggregation', 'governance', 'targeting', 'controls'];

export const adminStackConcepts = {
  aggregation: {
    step: 1,
    title: 'Aggregation',
    kicker: 'Admin stack · Estate-wide MIS',
    lead:
      'Structured returns from many units roll up into totals and charts only when definitions are consistent. Aggregation is the story of turning rows into insight — dashboards, filters, and exports that still mean something in a review meeting.',
    primaryCta: { label: 'Open dashboard', to: '/admin/dashboard' },
    sections: [
      {
        heading: 'What rolls up in this demo',
        bullets: [
          'Submission counts and status mixes (submitted, under review, approved, rejected) across the seeded dataset.',
          'Park- and type-flavoured views where industry master data is clean enough to group rows meaningfully.',
          'Export paths that pull approved structured records for offline analysis — pairing “live screen” with portable MIS.',
        ],
      },
      {
        heading: 'Why dirty master data breaks charts',
        paragraphs: [
          'If park or sector labels are inconsistent, filters slice the wrong cohort and totals mislead. Industries registry and disciplined filing are prerequisites for aggregation you can defend.',
        ],
      },
      {
        heading: 'Evaluator angle',
        bullets: [
          'Show one dashboard stat, then drill to Data Records or Industries to prove the number is tied to real rows.',
          'Mention trade-offs: near–real-time refresh is for desk use; exports are for slides and archival comparison.',
        ],
      },
    ],
  },
  governance: {
    step: 2,
    title: 'Governance',
    kicker: 'Admin stack · Review trail',
    lead:
      'Governance here means a visible decision path: submissions are reviewed, approved or rejected with remarks that industries see in their portal — not a black-box admin override.',
    primaryCta: { label: 'Open data records', to: '/admin/records' },
    sections: [
      {
        heading: 'What the trail is meant to show',
        bullets: [
          'Each decision is attributable: status changes with remarks industries can act on.',
          'Rejected rows stay in history so units can correct and resubmit — continuity for auditors and for your viva narrative.',
          'Admin actions align with “structured review” rather than ad-hoc edits in silos.',
        ],
      },
      {
        heading: 'How this differs from aggregation',
        paragraphs: [
          'Aggregation answers “how much / where”. Governance answers “who decided what, and why” — quality and accountability of the pipeline.',
        ],
      },
      {
        heading: 'Demo storyline',
        bullets: [
          'Filter records by park, walk one row from submitted to approved or rejected with a clear remark.',
          'Cross-reference My Submissions on the industry side so evaluators see both ends of the flow.',
        ],
      },
    ],
  },
  targeting: {
    step: 3,
    title: 'Targeting',
    kicker: 'Admin stack · Right audience',
    lead:
      'Announcements, schedules, and documents can be aimed at all industries, one park, or one sector type. Targeting is what stops estate-specific circulars from noise-blasting every unit in the dataset.',
    primaryCta: { label: 'Open announcements', to: '/admin/announcements' },
    sections: [
      {
        heading: 'What targeting depends on',
        bullets: [
          'Accurate industry profiles: park and type must match how you publish — wrong master data ⇒ wrong recipients.',
          'Consistent rules across Announcements, Schedule, and Documents so the portal feels coherent to industry users.',
        ],
      },
      {
        heading: 'What industries experience',
        paragraphs: [
          'Their Updates center only surfaces items they qualify for. Targeting is therefore both a publishing feature and a trust feature — mis-targeted content looks like system failure.',
        ],
      },
      {
        heading: 'Suggested demo',
        bullets: [
          'Post a notice limited to one SIPCOT park and confirm only matching profiles see it.',
          'Tie the story to Industries master: “we filter because registry fields allow it.”',
        ],
      },
    ],
  },
  controls: {
    step: 4,
    title: 'Controls',
    kicker: 'Admin stack · Access & roles',
    lead:
      'Controls combine technical enforcement (JWT, admin-only routes) with operational levers — such as activating or deactivating industry accounts — so access matches who should use the portal.',
    primaryCta: { label: 'Open users', to: '/admin/users' },
    sections: [
      {
        heading: 'Role separation',
        bullets: [
          'Industry users cannot hit /admin URLs; admin workflows stay behind admin JWT checks in this demo.',
          'Shared APIs still enforce role on the server — the UI hides menus, but the backend is the real gate.',
        ],
      },
      {
        heading: 'Account lifecycle (demo)',
        bullets: [
          'Deactivate stale or problematic industry logins until resolved; reactivate when appropriate.',
          'Framed as governance for evaluators — in production you would follow organisational IAM policy.',
        ],
      },
      {
        heading: 'How controls relate to targeting',
        paragraphs: [
          'Even perfect targeting rules fail if the wrong user can still log in. Controls sit alongside targeting as the other half of “who sees what and who can act.”',
        ],
      },
    ],
  },
};
