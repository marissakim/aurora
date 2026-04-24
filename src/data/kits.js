// Eve's at-home test kits — four options across two tiers:
//
//   PRIMARY  — Basic Fertility, Full Fertility. User picks one as
//              their baseline workup.
//   ADD-ONS  — Inflammation, Thyroid. Complement whichever primary
//              kit the user chooses; relevant for anyone trying to
//              conceive.
//
// White-labeled fulfillment from a partner lab; results ship into
// the app. Basic Fertility is the default primary; recommendKit()
// below promotes Full when the user's profile signals a reason to.
export const eveKits = [
  {
    id: 'basic',
    name: 'Basic Fertility Kit',
    price: 199,
    type: 'primary',
    tagline: 'Your fertility baseline in three numbers',
    description: 'The three most predictive markers for conception and egg-freezing decisions — the same panel most REs start with at a first visit.',
    markers: ['TSH', 'LH / FSH', 'AMH'],
    bestFor: ['anyone starting their fertility journey', 'baseline before egg freezing', 'regular cycles with no known issues'],
  },
  {
    id: 'full',
    name: 'Full Fertility Kit',
    price: 299,
    type: 'primary',
    tagline: 'Eleven-marker deep workup',
    description: 'The comprehensive hormonal panel an RE would order before IVF — adrenal, ovarian, thyroid, and androgen markers for the complete picture.',
    markers: [
      'Cortisol',
      'DHEA',
      'Estradiol',
      'FSH',
      'LH',
      'Progesterone',
      'Testosterone',
      'TPO (thyroid antibodies)',
      'TSH',
      'T4',
      'T3',
    ],
    bestFor: ['PCOS diagnosis or family history', 'irregular or absent cycles', 'low ovarian reserve', 'active IVF/IUI treatment'],
  },
  {
    id: 'inflammation',
    name: 'Inflammation Kit',
    price: 99,
    type: 'addon',
    tagline: 'For everyone trying to conceive',
    description: 'Measures hs-CRP and Vitamin D to gauge how well your body is positioned to support implantation — relevant for anyone trying to conceive, and especially valuable if you have endometriosis or another inflammatory condition. For men and women.',
    markers: ['High-Sensitivity C-Reactive Protein (hs-CRP)', 'Vitamin D'],
    bestFor: ['anyone trying to conceive', 'endometriosis or autoimmune concerns', 'optimizing implantation chances', 'partners who want to participate'],
  },
  {
    id: 'thyroid',
    name: 'Thyroid Kit',
    price: 99,
    type: 'addon',
    tagline: 'Focused thyroid screening',
    description: 'A dedicated thyroid panel for men and women. Even subclinical thyroid issues quietly disrupt cycles, ovulation, and implantation — and they\'re highly treatable. Best paired with the Basic Fertility Kit (the Full Fertility Kit already covers thyroid).',
    markers: ['TSH', 'T4', 'T3', 'TPO (thyroid antibodies)'],
    bestFor: ['anyone trying to conceive', 'unexplained fatigue or cycle changes', 'family history of thyroid issues', 'focused follow-up after a borderline TSH'],
  },
];

/**
 * Returns the PRIMARY kit id best matched to the user's profile.
 * Add-on kits (Inflammation, Thyroid) are surfaced separately in
 * the modal rather than as "the recommended kit".
 */
export function recommendKit(profile = {}) {
  // Deeper hormonal workup needed — PCOS signals, diminished reserve,
  // or users already in active treatment who want the complete picture.
  if (
    profile.conditions === 'PCOS'
    || profile.conditions === 'Low ovarian reserve'
    || profile.cycles === 'Irregular'
    || profile.cycles === 'Very light or absent'
    || profile.goal === 'In active IVF/IUI treatment'
  ) {
    return 'full';
  }
  // Default for everyone else — including Donor/surrogacy users, who just
  // need a baseline recipient panel rather than the expense of Full.
  return 'basic';
}

/**
 * Returns the two add-on kit ids that are relevant for anyone trying
 * to conceive. If the user has already picked the Full Fertility Kit
 * (which already covers thyroid), we suppress the Thyroid add-on to
 * avoid duplicate recommendations.
 */
export function recommendAddons(profile = {}, primaryKitId = null) {
  const addons = ['inflammation'];
  // Full already covers TSH, T3, T4, and TPO — no need for Thyroid add-on
  if (primaryKitId !== 'full') {
    addons.push('thyroid');
  }
  return addons;
}
