export const biomarkerDefs = [
  { name: 'AMH', unit: 'ng/mL', range: '1.0–3.5', description: 'Ovarian reserve indicator' },
  { name: 'FSH', unit: 'mIU/mL', range: '3.5–12.5', description: 'Egg quality and ovarian function' },
  { name: 'AFC', unit: 'follicles', range: '10–20', description: 'Antral follicle count via ultrasound' },
  { name: 'TSH', unit: 'mIU/L', range: '0.5–4.5', description: 'Thyroid function affects fertility' },
  { name: 'Vitamin D', unit: 'ng/mL', range: '30–60', description: 'Impacts implantation rates' },
  { name: 'BMI', unit: 'kg/m\u00B2', range: '18.5–24.9', description: 'Affects hormone balance and outcomes' },
];

export const sampleBiomarkers = [
  { name: 'AMH', value: 2.8, unit: 'ng/mL', status: 'good', range: '1.0–3.5', trend: [2.1, 2.4, 2.6, 2.7, 2.8] },
  { name: 'FSH', value: 7.2, unit: 'mIU/mL', status: 'good', range: '3.5–12.5', trend: [8.1, 7.8, 7.5, 7.3, 7.2] },
  { name: 'AFC', value: 14, unit: 'follicles', status: 'good', range: '10–20', trend: [12, 13, 13, 14, 14] },
  { name: 'TSH', value: 3.8, unit: 'mIU/L', status: 'attention', range: '0.5–4.5', trend: [2.9, 3.1, 3.4, 3.6, 3.8] },
  { name: 'Vitamin D', value: 22, unit: 'ng/mL', status: 'critical', range: '30–60', trend: [28, 26, 24, 23, 22] },
  { name: 'BMI', value: 23.1, unit: 'kg/m\u00B2', status: 'good', range: '18.5–24.9', trend: [23.5, 23.4, 23.3, 23.2, 23.1] },
];
