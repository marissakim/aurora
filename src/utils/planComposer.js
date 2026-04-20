// Plan composer — turns an onboarding profile into a personalized 4-phase
// plan. Each task has a stable id, a target phase, a priority (higher wins
// when we need to trim), a category for the UI badge, and a set of rules
// that determine when it applies.
//
// Voice principle: every task is phrased as a suggestion, not a command.
// "Consider X" / "It's worth ..." / "A common first step is ..." —
// never "You must" or "Do X by Y".

// Task library. Each entry is a single card a user might see in their plan.
// Matching is handled by composePlan() below, which evaluates a profile
// against each task's `when` function.
const TASKS = [
  // ─────────── Foundation (everyone sees most of these) ────────────
  {
    id: 'prenatal',
    text: 'Consider starting a daily prenatal vitamin (400–800 mcg folic acid)',
    category: 'Health',
    phase: 1,
    priority: 5,
    when: p => p.goal !== 'Donor/surrogacy',
  },
  {
    id: 'coq10',
    text: 'Consider adding CoQ10 (200 mg daily) — emerging evidence for egg quality',
    category: 'Health',
    phase: 1,
    priority: 4,
    when: p => ['Conceive', 'Freeze eggs', 'In treatment'].includes(p.goal),
  },
  {
    id: 'vitd',
    text: 'Consider 2000 IU Vitamin D daily if you haven\'t tested — most US adults are below optimal',
    category: 'Health',
    phase: 1,
    priority: 3,
    when: () => true,
  },

  // ─────────── Baseline testing (depends on testing answer) ────────
  {
    id: 'baseline-panel',
    text: 'Get a baseline fertility panel (AMH, FSH, AFC, TSH, Vitamin D)',
    category: 'Appointment',
    phase: 1,
    priority: 10,
    when: p => p.testing === 'Not yet',
  },
  {
    id: 'extended-panel',
    text: 'Add Estradiol, LH, and Prolactin to your next bloodwork — a fuller picture for the same visit',
    category: 'Appointment',
    phase: 2,
    priority: 6,
    when: p => p.testing === 'Yes, basic bloodwork',
  },
  {
    id: 'genetic-screen',
    text: 'Consider genetic carrier screening — most clinics recommend it before IVF or donor use',
    category: 'Appointment',
    phase: 3,
    priority: 5,
    when: p => p.testing !== 'Yes, plus genetic screening' && ['Freeze eggs', 'In treatment', 'Donor/surrogacy'].includes(p.goal),
  },
  {
    id: 'hsg',
    text: 'Ask your doctor about an HSG — a simple test that checks your fallopian tubes',
    category: 'Appointment',
    phase: 2,
    priority: 5,
    when: p => p.goal === 'Conceive' && (p.testing === 'Yes, basic bloodwork' || p.testing === 'Not yet'),
  },
  {
    id: 'semen-analysis',
    text: 'If you have a male partner, request a semen analysis — it\'s the single most overlooked test',
    category: 'Appointment',
    phase: 1,
    priority: 7,
    when: p => p.partner === 'Yes' && ['Conceive', 'In treatment'].includes(p.goal),
  },

  // ─────────── Provider consults (depends on goal + timeline) ──────
  {
    id: 're-consult',
    text: 'Book an initial consultation with a reproductive endocrinologist',
    category: 'Appointment',
    phase: 1,
    priority: 8,
    when: p => ['Freeze eggs', 'In treatment', 'Donor/surrogacy'].includes(p.goal),
  },
  {
    id: 'obgyn-preconception',
    text: 'Schedule a preconception checkup with your OB/GYN',
    category: 'Appointment',
    phase: 1,
    priority: 7,
    when: p => p.goal === 'Conceive',
  },
  {
    id: 'second-opinion',
    text: 'Consider a second opinion from another RE — fresh eyes often catch protocol tweaks',
    category: 'Appointment',
    phase: 2,
    priority: 7,
    when: p => p.goal === 'In treatment' && p.concern === 'Success rates',
  },
  {
    id: 'virtual-consult',
    text: 'A virtual fertility consult ($150–$250) can often answer your first questions without a full clinic intake',
    category: 'Appointment',
    phase: 1,
    priority: 9,
    when: p => p.concern === 'Finding a doctor' || p.concern === 'Understanding options',
  },

  // ─────────── Cycle tracking (for conception + irregular cycles) ──
  {
    id: 'cycle-tracking',
    text: 'Start tracking your cycle daily — BBT in the morning and an OPK mid-cycle gives you the clearest picture',
    category: 'Health',
    phase: 1,
    priority: 6,
    when: p => p.goal === 'Conceive' && p.cycles === 'Regular (24–35 days)',
  },
  {
    id: 'cycle-workup',
    text: 'Irregular cycles are worth investigating — a hormone panel (LH, testosterone, prolactin) plus a pelvic ultrasound clarifies the cause',
    category: 'Appointment',
    phase: 1,
    priority: 9,
    when: p => p.cycles === 'Irregular' || p.cycles === 'Very light or absent',
  },

  // ─────────── Condition-specific ──────────────────────────────────
  {
    id: 'pcos-endo',
    text: 'For PCOS, an endocrinology consult can be complementary to your RE — especially for metformin or inositol discussions',
    category: 'Appointment',
    phase: 2,
    priority: 7,
    when: p => p.conditions === 'PCOS',
  },
  {
    id: 'pcos-metabolic',
    text: 'Ask for a fasting insulin and HbA1c test — PCOS often has a metabolic component worth treating',
    category: 'Appointment',
    phase: 2,
    priority: 6,
    when: p => p.conditions === 'PCOS',
  },
  {
    id: 'endo-laparoscopy',
    text: 'Consider whether a diagnostic laparoscopy makes sense — it can confirm endometriosis staging and often improves conception odds',
    category: 'Appointment',
    phase: 3,
    priority: 6,
    when: p => p.conditions === 'Endometriosis',
  },
  {
    id: 'reserve-mini-ivf',
    text: 'With low ovarian reserve, ask your RE about mini-IVF or DuoStim protocols — sometimes better than standard stim',
    category: 'Appointment',
    phase: 2,
    priority: 8,
    when: p => p.conditions === 'Low ovarian reserve',
  },

  // ─────────── Partner structure ───────────────────────────────────
  {
    id: 'solo-donor-sperm',
    text: 'If you\'re planning solo parenthood, major sperm banks (Seattle Sperm Bank, California Cryobank) offer extensive screening',
    category: 'Appointment',
    phase: 2,
    priority: 7,
    when: p => p.partner === 'Solo' && ['Conceive', 'Freeze eggs'].includes(p.goal),
  },
  {
    id: 'solo-legal',
    text: 'For solo or donor arrangements, a reproductive lawyer can clarify parental rights — especially if you move states',
    category: 'Legal',
    phase: 3,
    priority: 6,
    when: p => ['Solo', 'Partner + donor gametes'].includes(p.partner),
  },

  // ─────────── Financial (depends on concern + insurance) ──────────
  {
    id: 'employer-benefits',
    text: 'Check your employer\'s benefits portal for fertility coverage — Carrot, Progyny, and Maven are the most common',
    category: 'Financial',
    phase: 1,
    priority: 7,
    when: p => p.concern === 'Cost' || p.insurance !== 'Yes',
  },
  {
    id: 'insurance-call',
    text: 'Call your insurance and ask specifically about "infertility diagnosis" vs "treatment" — many plans cover testing even when they exclude treatment',
    category: 'Financial',
    phase: 1,
    priority: 8,
    when: p => p.insurance !== 'No' && p.concern === 'Cost',
  },
  {
    id: 'insurance-decode',
    text: 'Pull your Summary of Benefits and scan for CPT code S4042 or infertility-related codes — it\'s the clearest way to see what\'s covered',
    category: 'Financial',
    phase: 2,
    priority: 6,
    when: p => p.insurance === "Some coverage, don't understand it",
  },
  {
    id: 'fsa-hsa',
    text: 'Set up (or increase) an FSA/HSA — fertility expenses qualify, and the pre-tax savings adds up',
    category: 'Financial',
    phase: 2,
    priority: 5,
    when: p => p.concern === 'Cost' || p.insurance === 'No',
  },
  {
    id: 'grants',
    text: 'Look into fertility grants — BabyQuest, Cade Foundation, and Baby Quest offer $2K–$16K per cycle',
    category: 'Financial',
    phase: 3,
    priority: 5,
    when: p => p.concern === 'Cost' && p.insurance !== 'Yes',
  },
  {
    id: 'financing',
    text: 'Consider fertility-specific financing — Future Family, ARC Fertility, and Sunfish have transparent rates',
    category: 'Financial',
    phase: 3,
    priority: 4,
    when: p => p.concern === 'Cost' && p.insurance !== 'Yes',
  },
  {
    id: 'cost-compare',
    text: 'Get quotes from 3 clinics — costs for the same cycle can vary by $8K+ between neighbors',
    category: 'Financial',
    phase: 2,
    priority: 5,
    when: p => p.concern === 'Cost' && p.goal !== 'Explore options',
  },
  {
    id: 'donor-funded-pointer',
    text: 'Donor-funded egg freezing programs (like Cofertility) can cover the cost entirely if you qualify — worth a 2-minute eligibility check',
    category: 'Financial',
    phase: 1,
    priority: 8,
    when: p => p.goal === 'Freeze eggs' && p.concern === 'Cost' && p.age !== '41+' && p.age !== '38–40',
  },

  // ─────────── Research / education (Understanding options) ────────
  {
    id: 'read-pathways',
    text: 'Spend 20 minutes on the Pathways tab — understanding what\'s realistic changes what you ask for',
    category: 'Health',
    phase: 1,
    priority: 6,
    when: p => p.concern === 'Understanding options',
  },
  {
    id: 'sart-data',
    text: 'Look up your clinic on SART (sart.org) — live birth rates by age tell you much more than marketing copy',
    category: 'Health',
    phase: 2,
    priority: 6,
    when: p => p.concern === 'Success rates' || p.concern === 'Finding a doctor',
  },
  {
    id: 'fertilityiq-review',
    text: 'Cross-check clinic reviews on FertilityIQ — patient experience often reveals what success-rate data doesn\'t',
    category: 'Health',
    phase: 2,
    priority: 5,
    when: p => p.concern === 'Finding a doctor' || p.concern === 'Success rates',
  },

  // ─────────── Timeline adjustments ────────────────────────────────
  {
    id: 'urgent-consult',
    text: 'Given your timeline, it\'s worth booking the RE consult in the next 7–14 days — waiting rooms are often 4+ weeks out',
    category: 'Appointment',
    phase: 1,
    priority: 9,
    when: p => p.timeline === 'Now' && ['38–40', '41+'].includes(p.age),
  },
  {
    id: 'natural-then-specialist',
    text: 'It\'s common to try naturally for 6 months before seeing a specialist — sooner for anyone over 35',
    category: 'Health',
    phase: 2,
    priority: 4,
    when: p => p.goal === 'Conceive' && ['Under 30', '30–34'].includes(p.age) && p.timeline !== 'Now',
  },

  // ─────────── Emotional / support (concern-driven) ────────────────
  {
    id: 'fertility-therapist',
    text: 'Find a fertility-informed therapist — RESOLVE has a national directory, and many take insurance',
    category: 'Health',
    phase: 1,
    priority: 7,
    when: p => p.concern === 'Emotional support',
  },
  {
    id: 'support-group',
    text: 'Consider a support group — RESOLVE, Pollie, and in-person groups through clinics all work for different people',
    category: 'Health',
    phase: 2,
    priority: 5,
    when: p => p.concern === 'Emotional support',
  },
  {
    id: 'partner-convo',
    text: 'Set aside 30 minutes with your partner to talk through budget, timeline, and what you each want — couples therapists specializing in fertility help if it\'s stuck',
    category: 'Health',
    phase: 2,
    priority: 5,
    when: p => p.concern === 'Emotional support' && p.partner === 'Yes',
  },

  // ─────────── Treatment-in-progress (In treatment goal) ───────────
  {
    id: 'request-records',
    text: 'Request copies of all your treatment records — you\'ll want them for any second opinion or protocol change',
    category: 'Appointment',
    phase: 1,
    priority: 6,
    when: p => p.goal === 'In treatment',
  },
  {
    id: 'protocol-review',
    text: 'Ask your RE to walk through why they chose this protocol specifically — and what they\'d change for a next cycle',
    category: 'Appointment',
    phase: 2,
    priority: 6,
    when: p => p.goal === 'In treatment',
  },

  // ─────────── Lifestyle (long-game) ──────────────────────────────
  {
    id: 'sleep',
    text: 'Aim for 7–8 hours of consistent sleep — poor sleep disrupts hormonal balance more than most people realize',
    category: 'Health',
    phase: 3,
    priority: 3,
    when: () => true,
  },
  {
    id: 'alcohol',
    text: 'If you drink, consider cutting to <3 drinks/week — both egg quality and implantation are sensitive to alcohol',
    category: 'Health',
    phase: 2,
    priority: 4,
    when: () => true,
  },
  {
    id: 'retest',
    text: 'Plan to retest your biomarkers in 3 months — worth seeing how your numbers trend',
    category: 'Appointment',
    phase: 4,
    priority: 4,
    when: () => true,
  },
];

/**
 * Compose a personalized plan from a profile.
 * Returns an array of phases, each with a title and a list of tasks.
 * Caller can override with a pathway-specific plan (e.g. donor-funded).
 */
export function composePlan(profile) {
  // Evaluate all tasks against the profile
  const matched = TASKS
    .filter(t => {
      try { return t.when(profile); }
      catch { return false; }
    });

  // Bucket by phase, sort within each by priority (high → low)
  const phases = [1, 2, 3, 4].map(phaseNum => ({
    num: phaseNum,
    title: ['This Week', 'Within 2 Weeks', 'This Month', 'Next 3 Months'][phaseNum - 1],
    tasks: matched
      .filter(t => t.phase === phaseNum)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5) // cap each phase at 5 tasks to avoid overwhelm
      .map(t => ({ id: t.id, text: t.text, category: t.category })),
  }));

  return phases;
}
