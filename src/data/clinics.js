// Real IVF clinics, grouped by metro. Success rates are approximate
// SART-style figures; always verify current stats on sart.org before
// trusting any clinic's marketing. Distance values are rough illustrative
// — a production version would use real geolocation.
export const clinics = [
  // ─────────── San Francisco Bay Area ───────────
  {
    name: 'Pacific Fertility Center',
    location: 'San Francisco, CA',
    city: 'SF Bay Area',
    url: 'https://www.pacificfertilitycenter.com',
    rating: 4.8,
    successRate: '62%',
    avgCost: '$18,500',
    specialty: 'IVF, Egg Freezing, LGBTQ+',
    distance: '2.3 mi',
  },
  {
    name: 'UCSF Center for Reproductive Health',
    location: 'San Francisco, CA',
    city: 'SF Bay Area',
    url: 'https://crh.ucsf.edu',
    rating: 4.7,
    successRate: '58%',
    avgCost: '$21,000',
    specialty: 'IVF, Recurrent Loss, Genetics',
    distance: '4.1 mi',
  },
  {
    name: 'Spring Fertility',
    location: 'San Francisco, CA',
    city: 'SF Bay Area',
    url: 'https://springfertility.com',
    rating: 4.9,
    successRate: '65%',
    avgCost: '$19,200',
    specialty: 'Egg Freezing, IVF, Mini-IVF',
    distance: '3.7 mi',
  },
  {
    name: 'Laurel Fertility Care',
    location: 'San Francisco, CA',
    city: 'SF Bay Area',
    url: 'https://www.laurelfertility.com',
    rating: 4.6,
    successRate: '55%',
    avgCost: '$16,800',
    specialty: 'IVF, IUI, Male Factor',
    distance: '5.2 mi',
  },

  // ─────────── New York City ───────────
  {
    name: 'CCRM New York',
    location: 'New York, NY',
    city: 'NYC',
    url: 'https://www.ccrmivf.com/locations/new-york',
    rating: 4.8,
    successRate: '60%',
    avgCost: '$22,000',
    specialty: 'IVF, Complex Cases, Genetic Testing',
    distance: '1.8 mi',
  },
  {
    name: 'RMA of New York',
    location: 'New York, NY',
    city: 'NYC',
    url: 'https://www.rmany.com',
    rating: 4.7,
    successRate: '63%',
    avgCost: '$21,500',
    specialty: 'IVF, Donor Eggs, High-Volume',
    distance: '2.4 mi',
  },
  {
    name: 'Weill Cornell Medicine — Center for Reproductive Medicine',
    location: 'New York, NY',
    city: 'NYC',
    url: 'https://ivf.org',
    rating: 4.7,
    successRate: '61%',
    avgCost: '$23,500',
    specialty: 'Academic, Research, Complex Infertility',
    distance: '3.1 mi',
  },
  {
    name: 'NYU Langone Fertility Center',
    location: 'New York, NY',
    city: 'NYC',
    url: 'https://nyulangone.org/locations/fertility-center',
    rating: 4.6,
    successRate: '57%',
    avgCost: '$20,800',
    specialty: 'IVF, Endometriosis, Academic',
    distance: '2.9 mi',
  },

  // ─────────── Los Angeles ───────────
  {
    name: 'HRC Fertility',
    location: 'Los Angeles, CA',
    city: 'LA',
    url: 'https://www.havingbabies.com',
    rating: 4.8,
    successRate: '64%',
    avgCost: '$19,500',
    specialty: 'IVF, Egg Freezing, LGBTQ+ Family Building',
    distance: '4.2 mi',
  },
  {
    name: 'Southern California Reproductive Center',
    location: 'Beverly Hills, CA',
    city: 'LA',
    url: 'https://www.scrcivf.com',
    rating: 4.9,
    successRate: '66%',
    avgCost: '$22,500',
    specialty: 'IVF, Donor Programs, High-Volume',
    distance: '6.1 mi',
  },
  {
    name: 'CCRM Los Angeles',
    location: 'Newport Beach, CA',
    city: 'LA',
    url: 'https://www.ccrmivf.com/locations/los-angeles',
    rating: 4.7,
    successRate: '61%',
    avgCost: '$21,800',
    specialty: 'IVF, Complex Cases, Genetic Testing',
    distance: '8.3 mi',
  },
  {
    name: 'California Fertility Partners',
    location: 'Los Angeles, CA',
    city: 'LA',
    url: 'https://www.californiafertilitypartners.com',
    rating: 4.7,
    successRate: '60%',
    avgCost: '$18,900',
    specialty: 'IVF, Male Factor, Surrogacy Coordination',
    distance: '3.8 mi',
  },
];

/**
 * Return clinics filtered by user's location preference.
 * - SF Bay Area / LA / NYC: show only that city's clinics
 * - Other major US city: show all 12 (better than nothing, acknowledges gap)
 * - Other / outside US: show all 12 with caller-side context
 */
export function clinicsForLocation(location) {
  if (location === 'SF Bay Area' || location === 'LA' || location === 'NYC') {
    return clinics.filter(c => c.city === location);
  }
  return clinics;
}
