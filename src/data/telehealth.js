// Telehealth providers shown on the Find Clinics → Virtual Care tab.
// First entry is "Telehealth for Eve Kits" — our complimentary
// kit-results-review consult that opens an in-app request flow instead
// of an external website. v0.2 swaps the manual calendar-invite flow
// for an integration with mylabbox.com's scheduling API.
//
// Other entries are real third-party providers; tapping them opens the
// provider's site in the in-app browser.
export const telehealthProviders = [
  {
    id: 'eve-kit-telehealth',
    internal: true, // signals FindClinics to render the request modal
    name: 'Telehealth for Eve Kits',
    tagline: 'Free 30-min lab-results review',
    description: 'After your at-home Eve Kit results come back, book a complimentary 30-minute video consult with the Eve team to walk through what your numbers mean and what to do next. Available to anyone who has ordered an Eve Kit.',
    offerings: ['Lab result review'],
    costRange: 'Free with any Eve Kit',
    idealFor: 'Eve Kit customers who want help interpreting their lab results',
    icon: '🌿',
  },
  {
    name: 'Maven Clinic',
    url: 'https://mavenclinic.com',
    tagline: 'Women\'s health platform with fertility track',
    description: 'Virtual care across the full fertility journey — from preconception planning to IVF support — often covered as an employer benefit.',
    offerings: ['Virtual consults', 'Care coordination', '24/7 messaging', 'Mental health'],
    costRange: 'Free with employer benefit · out-of-pocket varies',
    idealFor: 'Holistic support, employer-covered care, emotional support',
    icon: '💙',
  },
];
