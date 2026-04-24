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
    // Still relevant for donor-egg recipients who will carry the pregnancy
    when: () => true,
  },
  {
    id: 'coq10',
    text: 'Consider adding CoQ10 (200 mg daily) — emerging evidence for egg quality',
    category: 'Health',
    phase: 1,
    priority: 4,
    when: p => ['Conceive', 'Freeze eggs', 'In active IVF/IUI treatment'].includes(p.goal),
  },
  {
    id: 'vitd',
    text: 'Consider 2000 IU Vitamin D daily if you haven\'t tested — most US adults are below optimal',
    category: 'Health',
    phase: 1,
    priority: 3,
    // Only fires when no Vitamin D biomarker data exists. When we have
    // a real value, the vitd-low/vitd-critical tasks below take over.
    when: (p, b) => !findMarker(b, 'Vitamin D'),
  },

  // ─────────── Baseline testing (depends on testing answer) ────────
  {
    id: 'baseline-panel',
    text: 'Order an Eve Basic Fertility Kit ($199) — covers TSH, LH/FSH, and AMH. At-home finger prick, results in 5–7 days. The fastest way to get your baseline numbers.',
    category: 'Appointment',
    phase: 1,
    priority: 10,
    when: p => p.testing === 'Not yet' && (
      // Standard users without PCOS/reserve signals — Basic is enough
      (p.conditions !== 'PCOS'
        && p.conditions !== 'Low ovarian reserve'
        && p.cycles !== 'Irregular'
        && p.cycles !== 'Very light or absent')
      // OR donor/surrogacy users — just need baseline
      || p.goal === 'Donor/surrogacy'
    ),
  },
  {
    id: 'baseline-panel-full',
    text: 'Order an Eve Full Fertility Kit ($299) — adds cortisol, DHEA, Estradiol, Progesterone, Testosterone, and a complete thyroid panel (T3, T4, TPO). The comprehensive workup your situation warrants.',
    category: 'Appointment',
    phase: 1,
    priority: 10,
    when: p => p.testing === 'Not yet'
      && (p.conditions === 'PCOS' || p.conditions === 'Low ovarian reserve' || p.cycles === 'Irregular' || p.cycles === 'Very light or absent')
      && p.goal !== 'Donor/surrogacy',
  },
  {
    id: 'extended-panel',
    text: 'Upgrade to an Eve Full Fertility Kit ($299) — fills in Estradiol, Progesterone, T3/T4/TPO, cortisol, and DHEA that a basic panel misses. Worth it before any treatment protocol decisions.',
    category: 'Appointment',
    phase: 2,
    priority: 6,
    // Less relevant for donor-egg users — their own reproductive hormones matter less
    when: p => p.testing === 'Yes, basic bloodwork' && p.goal !== 'Donor/surrogacy',
  },
  {
    id: 'inflammation-addon',
    // Dynamic copy — the endometriosis version leads with that context.
    text: (p) => p.conditions === 'Endometriosis'
      ? 'Consider adding an Eve Inflammation Kit ($99) — endometriosis is an inflammatory condition, and hs-CRP + Vitamin D together tell you how well your body is positioned to support implantation. Pairs with whichever fertility kit you pick.'
      : 'Consider adding an Eve Inflammation Kit ($99) — hs-CRP and Vitamin D quietly shape implantation chances for everyone trying to conceive. Easy $99 add-on to whichever fertility kit you pick.',
    category: 'Health',
    phase: 2,
    // Bumped priority (6) slightly above the default 5 so endometriosis users
    // reliably see this task; non-endo users still see it alongside the other
    // phase-2 recommendations.
    priority: 6,
    when: p => p.testing === 'Not yet' && p.goal !== 'Donor/surrogacy',
  },
  {
    id: 'thyroid-addon',
    text: 'Consider adding an Eve Thyroid Kit ($99) to your Basic Fertility Kit — a focused T3 / T4 / TPO panel catches subclinical thyroid issues that quietly disrupt ovulation and implantation. Skip if you\'re going with the Full Fertility Kit, which already includes these.',
    category: 'Health',
    phase: 2,
    priority: 5,
    // Only suggest to users whose recommended primary kit is Basic.
    // Full already includes TSH/T3/T4/TPO so the Thyroid add-on would duplicate.
    when: p => p.testing === 'Not yet'
      && p.goal !== 'Donor/surrogacy'
      && !(p.conditions === 'PCOS'
        || p.conditions === 'Low ovarian reserve'
        || p.cycles === 'Irregular'
        || p.cycles === 'Very light or absent'
        || p.goal === 'In active IVF/IUI treatment'),
  },
  {
    id: 'genetic-screen',
    text: 'Consider genetic carrier screening — most clinics recommend it before IVF or donor use',
    category: 'Appointment',
    phase: 3,
    priority: 5,
    when: p => p.testing !== 'Yes, plus genetic screening' && ['Freeze eggs', 'In active IVF/IUI treatment', 'Donor/surrogacy'].includes(p.goal),
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
    when: p => p.partner === 'Yes' && ['Conceive', 'In active IVF/IUI treatment'].includes(p.goal),
  },

  // ─────────── Provider consults (depends on goal + timeline) ──────
  {
    id: 're-consult',
    text: 'Book an initial consultation with a reproductive endocrinologist',
    category: 'Appointment',
    phase: 1,
    priority: 8,
    when: p => ['Freeze eggs', 'In active IVF/IUI treatment', 'Donor/surrogacy'].includes(p.goal),
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
    when: p => p.goal === 'In active IVF/IUI treatment' && p.concern === 'Success rates',
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
    // Not relevant if the user is pursuing donor eggs
    when: p => p.conditions === 'Low ovarian reserve' && p.goal !== 'Donor/surrogacy',
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

  // ─────────── Consider donor eggs (40+ non-donor users) ─────────
  {
    id: 'evaluate-donor-eggs',
    text: 'Take some time to think through whether donor eggs are right for you — at your age, donor cycles often deliver 50–65% live birth rates vs. much lower with own eggs. It doesn\'t have to be the answer, but it\'s worth the conversation with your RE.',
    category: 'Health',
    phase: 1,
    priority: 9,
    when: p => ['38–40', '41+'].includes(p.age) && p.goal !== 'Donor/surrogacy',
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
    when: p => p.goal === 'In active IVF/IUI treatment',
  },
  {
    id: 'protocol-review',
    text: 'Ask your RE to walk through why they chose this protocol specifically — and what they\'d change for a next cycle',
    category: 'Appointment',
    phase: 2,
    priority: 6,
    when: p => p.goal === 'In active IVF/IUI treatment',
  },

  // ─────────── Donor / Surrogacy pathway ─────────────────────────
  {
    id: 'donor-state-law',
    text: 'Check your state\'s laws around donor conception and surrogacy — only ~15 states have clear surrogacy-friendly statutes, and it shapes every downstream decision',
    category: 'Legal',
    phase: 1,
    priority: 10,
    when: p => p.goal === 'Donor/surrogacy',
  },
  {
    id: 'donor-agency-research',
    text: 'Research 2–3 donor egg banks (Cofertility, Fairfax EggBank, Donor Egg Bank USA) — each has a different model (fresh vs frozen, matched vs bank, anonymous vs open)',
    category: 'Appointment',
    phase: 1,
    priority: 9,
    when: p => p.goal === 'Donor/surrogacy',
  },
  {
    id: 'donor-recipient-workup',
    text: 'Schedule a recipient medical workup: uterine ultrasound, saline sonogram, and endometrial biopsy if indicated. Your uterus, not your ovaries, is what matters most for this path',
    category: 'Appointment',
    phase: 2,
    priority: 9,
    when: p => p.goal === 'Donor/surrogacy',
  },
  {
    id: 'donor-legal-consult',
    text: 'Book a consult with a reproductive lawyer in your state — donor contracts and pre-birth orders are nuanced, and getting this right up front prevents costly issues later',
    category: 'Legal',
    phase: 2,
    priority: 9,
    when: p => p.goal === 'Donor/surrogacy',
  },
  {
    id: 'donor-psych-eval',
    text: 'Complete a psychological counseling session — most donor and surrogacy programs require it, and it\'s genuinely helpful for thinking through the emotional territory',
    category: 'Health',
    phase: 2,
    priority: 7,
    when: p => p.goal === 'Donor/surrogacy',
  },
  {
    id: 'donor-selection-criteria',
    text: 'Define your donor criteria: physical traits, education, CMV status, anonymous vs open-identity, medical history depth. Many programs let you filter by these upfront',
    category: 'Appointment',
    phase: 3,
    priority: 7,
    when: p => p.goal === 'Donor/surrogacy',
  },
  {
    id: 'donor-genetic-counseling',
    text: 'Meet with a genetic counselor before selecting a donor — they\'ll help you interpret donor genetic screening and flag any compatibility issues with your own carrier status',
    category: 'Appointment',
    phase: 3,
    priority: 7,
    when: p => p.goal === 'Donor/surrogacy',
  },
  {
    id: 'surrogacy-agency',
    text: 'If using a gestational carrier, start the agency application early — match timelines run 3–12 months. Circle Surrogacy, ConceiveAbilities, and Growing Generations are established options',
    category: 'Appointment',
    phase: 2,
    priority: 8,
    when: p => p.goal === 'Donor/surrogacy',
  },
  {
    id: 'donor-financial-reality',
    text: 'Plan your financial runway — donor egg cycles run $20–45K and surrogacy runs $100–200K+. Most insurance excludes both, so early financing or savings planning pays off',
    category: 'Financial',
    phase: 1,
    priority: 9,
    when: p => p.goal === 'Donor/surrogacy',
  },
  {
    id: 'donor-family-conversation',
    text: 'Consider when and how you\'ll tell your family (and any future children). The Donor Conception Network has excellent resources on age-appropriate conversations',
    category: 'Health',
    phase: 4,
    priority: 5,
    when: p => p.goal === 'Donor/surrogacy',
  },
  {
    id: 'donor-insurance-exclusions',
    text: 'Call your insurance specifically to ask about donor cycle and surrogacy coverage — these are almost always excluded, but confirming it helps you plan',
    category: 'Financial',
    phase: 2,
    priority: 6,
    when: p => p.goal === 'Donor/surrogacy' && p.insurance !== 'No',
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

  // ─────────── Biomarker-aware tasks ──────────────────────────────
  // These tasks react to actual biomarker values. Each has a `text`
  // function that embeds the user's number, and a `when` that checks
  // both profile AND biomarkers.
  {
    id: 'vitd-low',
    text: (p, b) => {
      const m = findMarker(b, 'Vitamin D');
      return `Your Vitamin D of ${m.value} ${m.unit} is below the 30 ng/mL threshold. 2000–4000 IU daily for 8–12 weeks typically restores levels — retest after.`;
    },
    category: 'Health',
    phase: 1,
    priority: 8,
    when: (p, b) => {
      const m = findMarker(b, 'Vitamin D');
      return m && m.value < 30 && m.value >= 20;
    },
  },
  {
    id: 'vitd-critical',
    text: (p, b) => {
      const m = findMarker(b, 'Vitamin D');
      return `Vitamin D of ${m.value} ${m.unit} is in the deficient range (below 20). Ask your doctor about a short 8–12 week course of higher-dose supplementation (often 5000+ IU or weekly prescription D2).`;
    },
    category: 'Health',
    phase: 1,
    priority: 9,
    when: (p, b) => {
      const m = findMarker(b, 'Vitamin D');
      return m && m.value < 20;
    },
  },
  {
    id: 'tsh-high',
    text: (p, b) => {
      const m = findMarker(b, 'TSH');
      return `Your TSH of ${m.value} ${m.unit} is above the 2.5 fertility target. Ask your doctor about a low-dose levothyroxine trial — easy to manage and often improves both cycle regularity and IVF outcomes.`;
    },
    category: 'Appointment',
    phase: 1,
    priority: 8,
    when: (p, b) => {
      const m = findMarker(b, 'TSH');
      return m && m.value > 2.5;
    },
  },
  {
    id: 'amh-low',
    text: (p, b) => {
      const m = findMarker(b, 'AMH');
      return `AMH of ${m.value} ${m.unit} indicates diminished ovarian reserve. If you're trying to conceive, it's worth moving your timeline up — reserve typically drops 10–15% per year at this level. Also ask your RE about mini-IVF or DuoStim protocols.`;
    },
    category: 'Appointment',
    phase: 1,
    priority: 9,
    when: (p, b) => {
      const m = findMarker(b, 'AMH');
      return m && m.value < 1.0 && p.goal !== 'Donor/surrogacy';
    },
  },
  {
    id: 'afc-low',
    text: (p, b) => {
      const m = findMarker(b, 'AFC');
      return `An AFC of ${m.value} suggests diminished reserve. Standard IVF stimulation may under-respond — worth discussing a DOR (diminished ovarian reserve) protocol with your RE.`;
    },
    category: 'Appointment',
    phase: 2,
    priority: 8,
    when: (p, b) => {
      const m = findMarker(b, 'AFC');
      return m && m.value < 7 && p.goal !== 'Donor/surrogacy';
    },
  },
  {
    id: 'lh-fsh-pcos',
    text: (p, b) => {
      const lh = findMarker(b, 'LH');
      const fsh = findMarker(b, 'FSH');
      const ratio = (lh.value / fsh.value).toFixed(1);
      return `Your LH:FSH ratio of ${ratio}:1 is a classic biochemical PCOS signal. A full workup — total + free testosterone, fasting insulin, HbA1c, and pelvic ultrasound — will confirm and shape the right protocol.`;
    },
    category: 'Appointment',
    phase: 1,
    priority: 9,
    when: (p, b) => {
      const lh = findMarker(b, 'LH');
      const fsh = findMarker(b, 'FSH');
      return lh && fsh && fsh.value > 0 && lh.value / fsh.value >= 2;
    },
  },
  {
    id: 'prolactin-high',
    text: (p, b) => {
      const m = findMarker(b, 'Prolactin');
      return `Prolactin of ${m.value} ${m.unit} is above the typical 3–25 range. A repeat draw in the morning (fasting, before exercise) usually clarifies. If it stays elevated, treatment is typically straightforward with oral cabergoline.`;
    },
    category: 'Appointment',
    phase: 2,
    priority: 7,
    when: (p, b) => {
      const m = findMarker(b, 'Prolactin');
      return m && m.value > 25;
    },
  },
  {
    id: 'estradiol-high-day3',
    text: (p, b) => {
      const m = findMarker(b, 'Estradiol');
      return `Day-3 Estradiol of ${m.value} ${m.unit} is elevated — this can artificially suppress FSH and mask declining reserve. Ask your RE to interpret your full Day-3 panel together, not FSH in isolation.`;
    },
    category: 'Appointment',
    phase: 2,
    priority: 7,
    when: (p, b) => {
      const m = findMarker(b, 'Estradiol');
      return m && m.value > 75;
    },
  },
  {
    id: 'bmi-out-of-range',
    text: (p, b) => {
      const m = findMarker(b, 'BMI');
      const direction = m.value < 18.5 ? 'below' : 'above';
      return `Your BMI of ${m.value} is ${direction} the 18.5–24.9 fertility-optimal range. Even a 5–10% shift can restore ovulation and improve treatment outcomes — worth working with a registered dietitian rather than crash-dieting.`;
    },
    category: 'Health',
    phase: 2,
    priority: 6,
    when: (p, b) => {
      const m = findMarker(b, 'BMI');
      return m && (m.value < 18.5 || m.value > 30);
    },
  },
  {
    id: 'strong-baseline',
    text: (p, b) => {
      const count = b.filter(x => x.status === 'good').length;
      return `${count} of your biomarkers are in range — a strong baseline. Focus your next steps on whichever pathway fits your goals rather than on optimizing the numbers further.`;
    },
    category: 'Health',
    phase: 4,
    priority: 3,
    when: (p, b) => {
      if (!b || b.length < 4) return false;
      const good = b.filter(m => m.status === 'good').length;
      return good >= 5 && good / b.length >= 0.8;
    },
  },
];

/**
 * Helper: find a biomarker entry by name in a list.
 */
function findMarker(biomarkers, name) {
  if (!Array.isArray(biomarkers)) return null;
  return biomarkers.find(m => m.name === name) || null;
}

/**
 * Compose a personalized plan from a profile and biomarkers.
 * Tasks' `when()` functions receive (profile, biomarkers); `text` may
 * also be a function with the same signature for values that embed
 * specific biomarker readings.
 * Caller can override with a pathway-specific plan (e.g. donor-funded).
 */
export function composePlan(profile, biomarkers = []) {
  const matched = TASKS
    .filter(t => {
      try { return t.when(profile, biomarkers); }
      catch { return false; }
    });

  // Resolve any dynamic text to its final string once we know the task matches
  const resolved = matched.map(t => ({
    ...t,
    resolvedText: typeof t.text === 'function' ? t.text(profile, biomarkers) : t.text,
  }));

  const phases = [1, 2, 3, 4].map(phaseNum => ({
    num: phaseNum,
    title: ['This Week', 'Within 2 Weeks', 'This Month', 'Next 3 Months'][phaseNum - 1],
    tasks: resolved
      .filter(t => t.phase === phaseNum)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5) // cap each phase at 5 tasks
      .map(t => ({ id: t.id, text: t.resolvedText, category: t.category })),
  }));

  return phases;
}
