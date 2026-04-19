/**
 * Detail pages for /guide/returns/:slug — "What each return is meant to reflect"
 */
export const RETURN_DOMAIN_SLUGS = ['economic', 'people', 'water', 'power', 'environment', 'csr'];

export const returnDomains = {
  economic: {
    step: 1,
    title: 'Investment & turnover',
    kicker: 'Return domain · Capex & revenue alignment',
    lead:
      'These fields show how your unit is performing financially in the reporting window — not marketing slides, but numbers you could explain to finance, auditors, or a bank if asked.',
    sections: [
      {
        heading: 'What it should mirror in real life',
        bullets: [
          'Investment / capex: machinery purchases, building additions, major retrofits — aligned to the same FY or quarter as your books (₹ lakhs/crores as per your chart of accounts).',
          'Turnover / revenue: gross sales for the selected period; ideally consistent with GST returns or audited statements for that window.',
          'If you export: where the form captures it, tie to shipping / SEZ / GST export lines so growth stories do not contradict customs or tax filings.',
        ],
      },
      {
        heading: 'Why reviewers care',
        paragraphs: [
          'Sudden jumps in turnover without employment or utility movement, or massive capex with flat headcount, trigger “sanity” checks — not automatic rejection, but a reason to read remarks or ask questions.',
        ],
      },
      {
        heading: 'Practical tip before you submit',
        bullets: [
          'Run a one-page reconciliation: portal totals vs trial balance / management accounts for the same quarter.',
          'If you capitalised a big asset mid-quarter, note it internally so the next submission still reads as one coherent story.',
        ],
      },
    ],
  },
  people: {
    step: 2,
    title: 'Workforce & skills',
    kicker: 'Return domain · Headcount & composition',
    lead:
      'Employment numbers should match how you actually pay people — payroll, contractor registers, and shift plans — not a rough guess.',
    sections: [
      {
        heading: 'What it should mirror',
        bullets: [
          'Total on rolls on a defined cut-off date (or average headcount if your policy uses that — be consistent each period).',
          'Male / female / skilled / unskilled splits from HR or muster; contractual vs permanent if the form asks for it.',
          'Local hiring from neighbouring districts when the estate or policy tracks inclusive employment.',
        ],
      },
      {
        heading: 'Common tripwires',
        bullets: [
          'Sub-totals that do not add to total employment.',
          'Headcount doubling while turnover and utilities stay flat — looks like a data entry slip.',
          'Contract workers counted inconsistently across quarters.',
        ],
      },
      {
        heading: 'Practical tip',
        paragraphs: [
          'Export a single HR summary for the quarter and attach it to your internal sign-off pack — then transcribe carefully into the portal once.',
        ],
      },
    ],
  },
  water: {
    step: 3,
    title: 'Water use & sourcing',
    kicker: 'Return domain · Intake, use, reuse',
    lead:
      'Water figures should be traceable to meters, tanker logs, or borewell readings — and broadly consistent with PCB consent quantities and your own EMS dashboard.',
    sections: [
      {
        heading: 'What it should mirror',
        bullets: [
          'Sources: borewell, municipal supply, tanker, recycle loop — as actually used on site.',
          'Metered consumption where available; recycle/reuse percentage if you measure return flows.',
          'Peak vs average if your EMS tracks it (optional narrative in remarks in real systems).',
        ],
      },
      {
        heading: 'Why it matters in an estate',
        paragraphs: [
          'Industrial clusters share stress on aquifers and treatment infrastructure. When many units file credible water lines, estate-level planning (STP capacity, recharge, tanker discipline) becomes possible.',
        ],
      },
      {
        heading: 'Practical tip',
        bullets: [
          'Pull the same numbers you would show during a PCB or third-party audit walk.',
          'If consent caps exist, keep internal calc sheets so portal entries do not exceed permitted withdrawal without explanation.',
        ],
      },
    ],
  },
  power: {
    step: 4,
    title: 'Energy & electricity',
    kicker: 'Return domain · Grid, load, renewables',
    lead:
      'Power consumption should reconcile with EB bills or sub-metering — and scale sensibly with production shifts.',
    sections: [
      {
        heading: 'What it should mirror',
        bullets: [
          'Grid kWh for the quarter (HT/LT bills aggregated).',
          'Contract demand / connected load if the form asks — as per sanction letter.',
          'Renewable or captive contribution only if separately metered; avoid double-counting grid draw.',
        ],
      },
      {
        heading: 'Sanity checks',
        bullets: [
          'kWh per unit of output or per employee should not swing wildly without a story (new line, shutdown week, harmonic issues with old meter, etc.).',
        ],
      },
      {
        heading: 'Practical tip',
        paragraphs: [
          'Maintain a simple spreadsheet: month-wise EB units → quarter sum → portal field. Screenshots optional for your internal file; the portal stores the structured numbers.',
        ],
      },
    ],
  },
  environment: {
    step: 5,
    title: 'Environmental compliance',
    kicker: 'Return domain · ETP/STP/RWH/solar',
    lead:
      'Tick-boxes and numeric fields here must reflect equipment that is actually running — the same story an inspector would see walking the battery limits.',
    sections: [
      {
        heading: 'What it should mirror',
        bullets: [
          'Effluent / STP operation status — yes/no should match samples and logs you maintain for PCB.',
          'Rainwater harvesting and solar generation — if claimed, capacity or generation should not be fantasy values.',
          'Any major change (new ETP stage, RO reject handling) should appear after internal commissioning, not randomly quarter-to-quarter.',
        ],
      },
      {
        heading: 'Why reviewers correlate this with others',
        paragraphs: [
          'Water + environment + chemical sector intensity together paint a believable profile. Contradictions (e.g. huge water draw with “no treatment”) invite remarks.',
        ],
      },
      {
        heading: 'Practical tip',
        bullets: [
          'Align with last consent conditions and renewal dates — your Schedule tab may already surface consent deadlines.',
        ],
      },
    ],
  },
  csr: {
    step: 6,
    title: 'CSR programmes & reporting',
    kicker: 'Return domain · Spend & beneficiaries',
    lead:
      'CSR lines should reconcile with programme-wise spending your board reports — totals and narratives should match, not compete.',
    sections: [
      {
        heading: 'What it should mirror',
        bullets: [
          'Activity-wise expenditure, beneficiaries, geography — same buckets as CSR annexures where applicable.',
          'Aggregate CSR field equals sum of programme lines (or documented rounding rules).',
          'Focus areas: education, health, sanitation, livelihood — as your company genuinely funds them.',
        ],
      },
      {
        heading: 'Review focus',
        bullets: [
          'Mismatch between CSR total and line items.',
          'Round “magic” numbers with no programme detail.',
        ],
      },
      {
        heading: 'Practical tip',
        paragraphs: [
          'Pull figures after CSR committee sign-off for the quarter; enter once into the portal after finance confirms payment runs.',
        ],
      },
    ],
  },
};
