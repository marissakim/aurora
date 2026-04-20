// Biomarkers split into "core" (most commonly available, enough to start)
// and "extended" (full clinic workup). UI uses progressive disclosure so
// users with an at-home panel see 6 fields, users with a clinic workup
// can expand to all 9.
export const biomarkerDefs = [
  // Core panel — matches typical at-home testing kits
  { name: 'AMH', unit: 'ng/mL', range: '1.0–3.5', description: 'Ovarian reserve indicator', tier: 'core' },
  { name: 'FSH', unit: 'mIU/mL', range: '3.5–12.5', description: 'Egg quality and ovarian function', tier: 'core' },
  { name: 'AFC', unit: 'follicles', range: '10–20', description: 'Antral follicle count via ultrasound', tier: 'core' },
  { name: 'TSH', unit: 'mIU/L', range: '0.5–4.5', description: 'Thyroid function affects fertility', tier: 'core' },
  { name: 'Vitamin D', unit: 'ng/mL', range: '30–60', description: 'Impacts implantation rates', tier: 'core' },
  { name: 'BMI', unit: 'kg/m\u00B2', range: '18.5–24.9', description: 'Affects hormone balance and outcomes', tier: 'core' },
  // Extended panel — common in a full clinic workup
  { name: 'Estradiol', unit: 'pg/mL', range: '25–75', description: 'Day-3 estrogen — paired with FSH', tier: 'extended' },
  { name: 'LH', unit: 'mIU/mL', range: '1.9–12.5', description: 'Ovulation trigger — informs LH:FSH ratio', tier: 'extended' },
  { name: 'Prolactin', unit: 'ng/mL', range: '3–25', description: 'Elevated levels can disrupt cycles', tier: 'extended' },
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
  'Estradiol': {
    fullName: 'Estradiol (E2)',
    whatItIs: 'The primary form of estrogen in your body. Produced mostly by growing follicles in the ovaries. Almost always drawn together with Day-3 FSH.',
    whatNumberMeans: 'Day 3: 25–75 pg/mL is normal. Above 80 on Day 3 can indicate early follicle recruitment, which artificially suppresses FSH and masks declining reserve.',
    whyItMatters: 'Context for FSH. A "normal" FSH with elevated E2 can actually mean ovarian reserve is worse than it looks. Most clinics require both numbers to interpret either.',
    whatYouCanDo: 'Always check E2 alongside FSH on cycle Day 2–4. If it\'s high, your FSH needs to be interpreted more cautiously.',
    testingCadence: 'Annually, always with Day-3 FSH. More often during IVF stimulation monitoring.',
  },
  'LH': {
    fullName: 'Luteinizing Hormone',
    whatItIs: 'The hormone that triggers ovulation mid-cycle. Also measured on Day 3 as a companion to FSH.',
    whatNumberMeans: 'Day 3: 1.9–12.5 mIU/mL is typical. More telling is the **LH:FSH ratio** — if LH is more than 2× FSH, it\'s a classic PCOS marker.',
    whyItMatters: 'Elevated LH disrupts the maturation of eggs and is one of the most reliable biochemical signatures of PCOS — which affects roughly 1 in 10 women of reproductive age.',
    whatYouCanDo: 'If LH:FSH is high, a full PCOS workup (testosterone, insulin, pelvic ultrasound) is worth pursuing. PCOS is very treatable, and knowing early changes the protocol.',
    testingCadence: 'Annually on Day 3 with FSH and E2. Urine LH strips for ovulation prediction at home.',
  },
  'Prolactin': {
    fullName: 'Prolactin',
    whatItIs: 'A pituitary hormone best known for milk production — but it also silently regulates the menstrual cycle. Elevated prolactin suppresses ovulation.',
    whatNumberMeans: 'Non-pregnant: 3–25 ng/mL is typical. Above 25–30 is considered hyperprolactinemia and can cause missed or irregular periods.',
    whyItMatters: 'A cheap test that catches a surprisingly common cause of unexplained infertility. Stress, certain medications (SSRIs), and small benign pituitary tumors can all raise it.',
    whatYouCanDo: 'If elevated, a simple MRI rules out a prolactinoma. Most cases are treated with a well-tolerated oral medication (cabergoline) that normalizes levels quickly.',
    testingCadence: 'Annually, or whenever cycles become irregular. Draw in the morning, fasting, before exercise or nipple stimulation.',
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
