export const biomarkerDefs = [
  { name: 'AMH', unit: 'ng/mL', range: '1.0–3.5', description: 'Ovarian reserve indicator' },
  { name: 'FSH', unit: 'mIU/mL', range: '3.5–12.5', description: 'Egg quality and ovarian function' },
  { name: 'AFC', unit: 'follicles', range: '10–20', description: 'Antral follicle count via ultrasound' },
  { name: 'TSH', unit: 'mIU/L', range: '0.5–4.5', description: 'Thyroid function affects fertility' },
  { name: 'Vitamin D', unit: 'ng/mL', range: '30–60', description: 'Impacts implantation rates' },
  { name: 'BMI', unit: 'kg/m\u00B2', range: '18.5–24.9', description: 'Affects hormone balance and outcomes' },
];

// Educational content shown in the expanded biomarker card.
// Tone: evidence-based, accessible, actionable.
export const biomarkerEducation = {
  'AMH': {
    fullName: 'Anti-Müllerian Hormone',
    whatItIs: 'A hormone produced by the small follicles in your ovaries. More follicles = more AMH. It\'s the single best blood marker of your remaining egg supply.',
    whatNumberMeans: 'Normal is 1.0–3.5 ng/mL. Below 1.0 suggests diminished ovarian reserve. Above 3.5 can indicate PCOS. AMH naturally declines with age — there\'s no "catching up."',
    whyItMatters: 'Best predictor of how your ovaries will respond to IVF stimulation. A higher AMH usually means more mature eggs retrieved per cycle, and more shots on goal.',
    whatYouCanDo: 'You can\'t raise AMH — it reflects existing reserve. But the earlier you know your number, the more time you have to plan (freezing sooner, choosing higher-yield protocols, etc.).',
    testingCadence: 'Once a year if stable, more often if trending down quickly.',
  },
  'FSH': {
    fullName: 'Follicle Stimulating Hormone',
    whatItIs: 'The signal your brain sends to your ovaries each cycle to start maturing an egg. When ovaries stop responding well, the brain cranks FSH higher to compensate.',
    whatNumberMeans: 'Measured on Day 3 of your cycle. 3.5–12.5 mIU/mL is normal. Above 10 starts to suggest declining reserve; above 20 is significant.',
    whyItMatters: 'Rising FSH is often the first hormonal signal that reserve is declining — sometimes before AMH changes. Day-3 FSH plus AMH plus AFC gives the clearest reserve picture.',
    whatYouCanDo: 'Like AMH, FSH reflects underlying reserve. High values don\'t rule out conception but may mean adjusting protocols (e.g., mini-IVF, higher stim doses).',
    testingCadence: 'Annually with estradiol (E2); always on cycle Day 2–4 for accuracy.',
  },
  'AFC': {
    fullName: 'Antral Follicle Count',
    whatItIs: 'A direct count of small (2–10 mm) follicles visible on a transvaginal ultrasound at the start of your cycle. Each antral follicle has the potential to mature into an egg.',
    whatNumberMeans: '10–20 is typical. Under 7 suggests diminished reserve; over 25 can indicate PCOS. Both ovaries are counted.',
    whyItMatters: 'Unlike AMH (a blood proxy), AFC is a real-time visual count — and it\'s highly predictive of how many eggs IVF stimulation will produce. Most REs want both.',
    whatYouCanDo: 'AFC can fluctuate cycle to cycle. If it\'s borderline, repeat in 2–3 months before making major treatment decisions.',
    testingCadence: 'Every 6–12 months, always in the early follicular phase (cycle days 2–5).',
  },
  'TSH': {
    fullName: 'Thyroid Stimulating Hormone',
    whatItIs: 'The pituitary\'s signal to the thyroid gland. Measures how hard your body is working to make thyroid hormone.',
    whatNumberMeans: 'General population: 0.5–4.5 mIU/L is "normal." For fertility, most REs prefer under 2.5 mIU/L before IVF or trying to conceive.',
    whyItMatters: 'Even subclinical hypothyroidism (TSH 2.5–4.5) is linked to irregular cycles, higher miscarriage rates, and reduced IVF success. Very treatable.',
    whatYouCanDo: 'If elevated, a low-dose of levothyroxine can normalize levels in 6–8 weeks. Retest 6 weeks after any dose change, and again in pregnancy.',
    testingCadence: 'Annually; every 6–8 weeks if on medication or adjusting dose.',
  },
  'Vitamin D': {
    fullName: '25-hydroxyvitamin D',
    whatItIs: 'A fat-soluble hormone made from sunlight (UVB) on your skin and absorbed from fatty fish, fortified foods, and supplements. Regulates calcium, immunity, and cell growth.',
    whatNumberMeans: 'Below 20 ng/mL = deficient. 20–29 = insufficient. 30–60 = sufficient. Many clinicians target 40–60 for fertility.',
    whyItMatters: 'Linked to implantation rates, embryo quality, and pregnancy outcomes. Roughly 40% of U.S. adults are deficient — easily missed, easily fixed.',
    whatYouCanDo: '2,000–4,000 IU daily for 8–12 weeks typically restores levels. Take with fat for absorption. Retest before IVF or TTC.',
    testingCadence: 'Annually; 3 months after starting or changing supplementation.',
  },
  'BMI': {
    fullName: 'Body Mass Index',
    whatItIs: 'Weight ÷ height² — a rough proxy for body composition. Blunt tool, but widely used because it\'s simple and correlates with outcomes at the population level.',
    whatNumberMeans: '18.5–24.9 is associated with the best fertility outcomes. Most REs will treat in the 18.5–35 range; over 40 may require weight optimization before IVF.',
    whyItMatters: 'Very high or very low BMI disrupts ovulation, hormone balance (estrogen, insulin), and IVF response. Egg and embryo quality also suffer at extremes.',
    whatYouCanDo: 'Even a 5–10% weight change can restore regular ovulation and improve outcomes. Work with a registered dietitian rather than crash-dieting — sudden loss can hurt cycles.',
    testingCadence: 'Monthly self-check at home; before starting any treatment cycle.',
  },
};

export const sampleBiomarkers = [
  { name: 'AMH', value: 2.8, unit: 'ng/mL', status: 'good', range: '1.0–3.5', trend: [2.1, 2.4, 2.6, 2.7, 2.8] },
  { name: 'FSH', value: 7.2, unit: 'mIU/mL', status: 'good', range: '3.5–12.5', trend: [8.1, 7.8, 7.5, 7.3, 7.2] },
  { name: 'AFC', value: 14, unit: 'follicles', status: 'good', range: '10–20', trend: [12, 13, 13, 14, 14] },
  { name: 'TSH', value: 3.8, unit: 'mIU/L', status: 'attention', range: '0.5–4.5', trend: [2.9, 3.1, 3.4, 3.6, 3.8] },
  { name: 'Vitamin D', value: 22, unit: 'ng/mL', status: 'critical', range: '30–60', trend: [28, 26, 24, 23, 22] },
  { name: 'BMI', value: 23.1, unit: 'kg/m\u00B2', status: 'good', range: '18.5–24.9', trend: [23.5, 23.4, 23.3, 23.2, 23.1] },
];
