export const costData = [
  { pathway: 'Natural Conception', low: 200, average: 1100, high: 2000 },
  { pathway: 'IUI', low: 500, average: 2250, high: 4000 },
  { pathway: 'IVF', low: 15000, average: 22500, high: 30000 },
  { pathway: 'Egg Freezing', low: 8000, average: 13000, high: 18000 },
  { pathway: 'Donor Eggs/Sperm', low: 20000, average: 32500, high: 45000 },
  { pathway: 'Surrogacy', low: 100000, average: 150000, high: 200000 },
];

// Real fertility-financial partners. Each card links out to the partner's
// site. Three of these (Carrot, Progyny, Maven) are employer-sponsored
// benefits — Cofertility is direct-to-consumer.
export const financialResources = [
  {
    name: 'Cofertility',
    url: 'https://cofertility.com',
    tagline: 'Free egg freezing via donation',
    description: 'Donate half your eggs to an intended parent and receive your egg freezing cycle (and 10 years of storage) at no cost.',
    icon: '\uD83D\uDC9D',
  },
  {
    name: 'Carrot Fertility',
    url: 'https://get-carrot.com',
    tagline: 'Employer-sponsored fertility benefits',
    description: 'Comprehensive fertility coverage offered through your employer. Check your benefits portal to see if Carrot is included.',
    icon: '\uD83E\uDD55',
  },
  {
    name: 'Progyny',
    url: 'https://progyny.com',
    tagline: 'Employer-sponsored, with care navigation',
    description: 'Fertility benefits platform with personal care advocates and a curated network of clinics. Available through participating employers.',
    icon: '\uD83C\uDF31',
  },
  {
    name: 'Maven Clinic',
    url: 'https://mavenclinic.com',
    tagline: 'Women\'s health benefits, including fertility',
    description: 'Virtual care platform covering preconception, fertility, and family-building. Often offered as part of employer benefits.',
    icon: '\uD83D\uDC99',
  },
];
