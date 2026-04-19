/**
 * Content for /guide/walkthrough/:slug — used by IndustryWalkthroughStep.jsx
 * slide: 'ltr' | 'rtl' — page entrance direction (unique feel per step)
 */
export const WALKTHROUGH_SLUGS = ['my-industry', 'submit-data', 'my-submissions', 'updates'];

export const walkthroughSteps = {
  'my-industry': {
    stepNum: 1,
    slide: 'ltr',
    kicker: 'Walkthrough · Step 1',
    title: 'My Industry',
    lead:
      'Your establishment’s master profile: how the system knows which unit you represent and how to route circulars and checks.',
    primaryCta: { label: 'Open My Industry', to: '/industry' },
    sections: [
      {
        label: 'What it is',
        paragraphs: [
          'A structured record of your company or unit—name, registration identifiers, SIPCOT park or estate, industry type (for example manufacturing, textile, chemical—per the categories in the form), scale category, location, and authorised contacts. It is the digital counterpart of “which plot or shed in which industrial estate.”',
        ],
      },
      {
        label: 'Which industry user can do this',
        paragraphs: [
          'Any active user logged in as industry. Each account is tied to one industry record in the database—typically one operating unit. You edit the profile your project allows (some fields may be seeded or admin-maintained depending on deployment).',
        ],
      },
      {
        label: 'What you should complete / have ready',
        bullets: [
          'Correct SIPCOT park and industry type—these drive targeting for announcements and documents.',
          'Scale (Large/Medium/Small/Micro), address, and contact person details that match allotment or board resolutions where applicable.',
          'A reachable phone and email for verification—not a generic mailbox no one monitors.',
          'Internal clarity on legal/trade name vs. plant name so submissions stay consistent across periods.',
        ],
      },
      {
        label: 'Why it matters',
        paragraphs: [
          'Wrong park or type means you may miss estate-specific circulars or see content meant for others. Keeping this updated after expansion, plot change, or contact turnover avoids MIS and communication gaps during inspections or data reviews.',
        ],
      },
    ],
  },
  'submit-data': {
    stepNum: 2,
    slide: 'rtl',
    kicker: 'Walkthrough · Step 2',
    title: 'Submit Data',
    lead:
      'Where you file quarterly or annual monitoring returns—investment, turnover, employment, utilities, CSR, and environmental indicators for a chosen reporting window.',
    primaryCta: { label: 'Go to Submit Data', to: '/data/submit' },
    sections: [
      {
        label: 'What it is',
        paragraphs: [
          'The operational form for periodic compliance-style reporting to the administrator. You pick year and quarter (Q1–Q4 or Annual), enter numeric and descriptive fields, then submit for review—distinct from merely updating the static profile.',
        ],
      },
      {
        label: 'Which industry user can do this',
        paragraphs: [
          'Same industry role users, for their linked unit only. You cannot submit returns for another company’s account. If your organisation needs multiple units, each unit would normally map to its own industry login in a full deployment.',
        ],
      },
      {
        label: 'What you need before submitting',
        bullets: [
          'My Industry filled enough that park/type and identity are correct—otherwise analytics and targeting drift.',
          'Numbers aligned with internal sources: finance (turnover/capex), HR (headcount splits), utilities (EB/EMS), CSR schedules—signed off internally if your firm requires it.',
          'A clear reporting period (no overlap with an already-submitted final return for the same quarter/year unless your process allows replacement).',
        ],
      },
      {
        label: 'Important',
        paragraphs: [
          'Use drafts if the UI supports them, then submit when figures are final. Totals must reconcile (for example employment breakdown vs total). Treat submission as a formal return—avoid placeholder values on the deadline day.',
        ],
      },
    ],
  },
  'my-submissions': {
    stepNum: 3,
    slide: 'ltr',
    kicker: 'Walkthrough · Step 3',
    title: 'My Submissions',
    lead: 'Your audit trail of every data return: status, timestamps, and administrator remarks.',
    primaryCta: { label: 'Open My Submissions', to: '/data/my' },
    sections: [
      {
        label: 'What it is',
        paragraphs: [
          'A list or table of your unit’s submitted records—typically showing Draft, Submitted, Under Review, Approved, or Rejected, plus when the record was filed and reviewed. This is where transparency lives for “what did we file, and what did the admin say?”',
        ],
      },
      {
        label: 'Which industry user can see this',
        paragraphs: [
          'Industry users see only their own industry’s submissions. You do not see other companies’ rows. Admins see a cross-estate view in their own module.',
        ],
      },
      {
        label: 'What you should do here',
        bullets: [
          'Monitor status after each submission; expect Under Review during validation.',
          'If Rejected, read every line of admin remarks and correct the specified fields or periods.',
          'Do not create confusing duplicate filings for the same reporting window—follow remarks or admin guidance on whether to edit vs resubmit.',
        ],
      },
      {
        label: 'Important',
        paragraphs: [
          'This screen is the authoritative status even if email or SMS exists later—always confirm here. Keep screenshots or exports for your internal audit file if your college demo requires evidence.',
        ],
      },
    ],
  },
  updates: {
    stepNum: 4,
    slide: 'rtl',
    kicker: 'Walkthrough · Step 4',
    title: 'Updates',
    lead:
      'The Updates Center: announcements, inspection and deadline schedules, and downloadable circulars or templates aimed at estates or sectors.',
    primaryCta: { label: 'Open Updates Center', to: '/updates' },
    sections: [
      {
        label: 'What it is',
        paragraphs: [
          'Three streams of content—Announcements (policy and operational notices), Schedule (inspections, consent deadlines, review meetings), and Documents (PDFs/spreadsheets). Admins publish; your view is filtered by audience rules.',
        ],
      },
      {
        label: 'Which industry sees what',
        paragraphs: [
          'Items may target all industries, only a specific SIPCOT park, or only a specific industry type. Your My Industry park and type must match for targeted items to appear. If something is missing, fix the profile first, then refresh.',
        ],
      },
      {
        label: 'What you need',
        bullets: [
          'Accurate park/type on your profile; account must be active (not deactivated by admin).',
          'Habit of checking before critical dates—especially schedule entries tied to inspections or filing deadlines.',
          'For downloads, a browser that allows file save; store copies in your unit’s compliance folder.',
        ],
      },
      {
        label: 'Important',
        paragraphs: [
          'Missing an announcement does not remove your obligation to meet real statutory deadlines in production systems—here, treat Updates as the demo’s channel for “what the estate expects next.”',
        ],
      },
    ],
  },
};
