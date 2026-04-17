const defaultPlan = [
  {
    title: 'This Week',
    tasks: [
      { id: 1, text: 'Start Vitamin D supplementation (2000 IU daily)', category: 'Health' },
      { id: 2, text: 'Book initial consultation with RE', category: 'Appointment' },
      { id: 3, text: 'Check employer fertility benefits portal', category: 'Financial' },
    ],
  },
  {
    title: 'Within 2 Weeks',
    tasks: [
      { id: 4, text: 'Begin CoQ10 supplementation (200mg daily)', category: 'Health' },
      { id: 5, text: 'Request AMH and FSH retest from your doctor', category: 'Appointment' },
      { id: 6, text: 'Compare costs at top 3 clinics', category: 'Financial' },
    ],
  },
  {
    title: 'This Month',
    tasks: [
      { id: 7, text: 'Complete initial consultation with RE', category: 'Appointment' },
      { id: 8, text: 'Recheck Vitamin D levels after supplementation', category: 'Health' },
      { id: 9, text: 'Set up FSA/HSA for fertility expenses', category: 'Financial' },
      { id: 10, text: 'Review and update biomarker results', category: 'Health' },
    ],
  },
  {
    title: 'Next 3 Months',
    tasks: [
      { id: 11, text: 'Follow up on treatment plan from RE', category: 'Appointment' },
      { id: 12, text: 'Apply for fertility grants if needed', category: 'Financial' },
      { id: 13, text: 'Begin recommended treatment protocol', category: 'Health' },
      { id: 14, text: 'Schedule follow-up appointment', category: 'Appointment' },
    ],
  },
];

// Donor-funded egg freezing plan — activated when user completes the
// Cofertility eligibility intake on the Pathways tab.
const splitFreezePlan = [
  {
    title: 'This Week',
    tasks: [
      { id: 101, text: 'Watch for Cofertility response (2–3 business days, check spam)', category: 'Appointment' },
      { id: 102, text: 'Review Cofertility Freeze by Co program overview at cofertility.com', category: 'Appointment' },
      { id: 103, text: 'Start prenatal vitamin + CoQ10 (200mg daily)', category: 'Health' },
      { id: 104, text: 'Stop alcohol, smoking, or vaping (required for donor eligibility)', category: 'Health' },
    ],
  },
  {
    title: 'Within 2 Weeks',
    tasks: [
      { id: 105, text: 'Schedule intro video call with Cofertility coordinator', category: 'Appointment' },
      { id: 106, text: 'Review the Freeze by Co program agreement & consent forms', category: 'Legal' },
      { id: 107, text: 'Complete detailed medical history questionnaire', category: 'Appointment' },
      { id: 108, text: 'Complete mental-health pre-screening', category: 'Health' },
    ],
  },
  {
    title: 'This Month',
    tasks: [
      { id: 109, text: 'Complete genetic carrier screening (covered by program)', category: 'Health' },
      { id: 110, text: 'Meet with Cofertility partner reproductive endocrinologist', category: 'Appointment' },
      { id: 111, text: 'Complete psychological evaluation with licensed therapist', category: 'Health' },
      { id: 112, text: 'Discuss match preferences (location, family structure, anonymity)', category: 'Legal' },
    ],
  },
  {
    title: 'Next 3 Months',
    tasks: [
      { id: 113, text: 'Match with an intended parent', category: 'Legal' },
      { id: 114, text: 'Start birth-control pill to synchronize cycles', category: 'Health' },
      { id: 115, text: 'Begin 8–12 days of stimulation injections', category: 'Health' },
      { id: 116, text: 'Egg retrieval & vitrification — half frozen for you, half for match', category: 'Appointment' },
      { id: 117, text: 'Recover 7–14 days and schedule follow-up', category: 'Health' },
    ],
  },
];

export function getPlanForPathway(pathwayId) {
  if (pathwayId === 'splitFreeze') return splitFreezePlan;
  return defaultPlan;
}

// Kept for backwards compatibility with any direct imports
export const planPhases = defaultPlan;
