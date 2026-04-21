// Eve's at-home test kits — three options, each measuring a different
// hormonal/metabolic profile from a single finger-prick blood draw.
// White-labeled fulfillment from a partner lab; results ship into the app.
export const eveKits = [
  {
    id: 'reproductive',
    name: 'Reproductive Health Kit',
    price: 149,
    tagline: 'The complete fertility baseline',
    description: 'Our most popular kit — measures the seven hormones an RE looks at first.',
    markers: ['AMH', 'FSH', 'LH', 'Estradiol', 'Prolactin', 'TSH', 'Vitamin D'],
    bestFor: ['anyone starting their fertility journey', 'baseline before egg freezing', 'regular cycle tracking'],
  },
  {
    id: 'pcos',
    name: 'PCOS Health Kit',
    price: 179,
    tagline: 'If you suspect or have PCOS',
    description: 'Targets the metabolic and androgen markers that distinguish PCOS subtypes — and tells you what kind of treatment will actually work.',
    markers: ['LH', 'FSH', 'Total Testosterone', 'Free Testosterone', 'DHEAS', 'Fasting Insulin', 'HbA1c', 'TSH', 'Prolactin'],
    bestFor: ['irregular or absent cycles', 'PCOS diagnosis or family history', 'unexplained weight changes'],
  },
  {
    id: 'metabolic',
    name: 'Metabolic Health Kit',
    price: 169,
    tagline: 'The foundation underneath fertility',
    description: 'Insulin sensitivity, thyroid, and lipids quietly shape ovulation and implantation. This kit catches what the standard fertility panel misses.',
    markers: ['HbA1c', 'Fasting Insulin', 'Lipid Panel (LDL, HDL, Trigs)', 'Vitamin D', 'TSH', 'Free T4', 'ALT (liver)'],
    bestFor: ['weight or insulin concerns', 'thyroid optimization', 'pre-IVF protocol planning'],
  },
];

// Returns the kit id that's best matched to the user's profile.
// Used to show a "Recommended for you" badge in the kit modal.
export function recommendKit(profile = {}) {
  if (profile.conditions === 'PCOS' || profile.cycles === 'Irregular' || profile.cycles === 'Very light or absent') {
    return 'pcos';
  }
  // Default: most fertility-stage users benefit from the reproductive kit
  return 'reproductive';
}
