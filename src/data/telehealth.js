// Telehealth providers shown on the Find Clinics → Virtual Care tab.
// First entry is "Eve Care" — our complimentary consult that opens an
// in-app request flow instead of an external website. v0.2 swaps the
// manual calendar-invite flow for an integration with mylabbox.com's
// scheduling API.
//
// Other entries are real third-party providers; tapping them opens the
// provider's site in the in-app browser.
export const telehealthProviders = [
  {
    id: 'eve-care',
    internal: true, // signals FindClinics to render the request modal
    name: 'Eve Care',
    tagline: 'Free 30-min consult with the Eve team',
    description: 'Get help interpreting your biomarkers, walking through pathway options, or thinking through next steps with someone who knows your data. Share three times that work for you and we\'ll send a calendar invite.',
    offerings: ['Plan review', 'Biomarker walkthrough', 'Pathway guidance', 'Q&A'],
    costRange: 'Complimentary',
    idealFor: 'Eve users who want a human to help interpret their data',
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
