const ageScores = { 'Under 30': 95, '30–34': 85, '35–37': 70, '38–40': 55, '41+': 35 };
const conditionScores = { 'None that I know of': 90, 'PCOS': 60, 'Endometriosis': 55, 'Low ovarian reserve': 40, 'Other / not sure': 65 };
const testingScores = { 'Not yet': 50, 'Yes, basic bloodwork': 65, 'Yes, full workup': 80, 'Yes, plus genetic screening': 90 };
const cycleScores = { 'Regular (24–35 days)': 90, 'Irregular': 55, 'Very light or absent': 40, 'Not sure': 60 };

export function computeDimensions(profile) {
  const age = ageScores[profile.age] || 70;
  const condition = conditionScores[profile.conditions] || 70;
  const testing = testingScores[profile.testing] || 60;
  const cycles = cycleScores[profile.cycles] || 65;

  return {
    'Ovarian Reserve': Math.round(age * 0.6 + condition * 0.4),
    'Hormonal Balance': Math.round(cycles * 0.6 + condition * 0.4),
    'Nutritional Health': 58,
    'Lifestyle Factors': 72,
    'Reproductive Age': age,
    'Medical History': Math.round(condition * 0.5 + testing * 0.5),
  };
}

const weights = {
  'Ovarian Reserve': 0.25,
  'Hormonal Balance': 0.20,
  'Nutritional Health': 0.15,
  'Lifestyle Factors': 0.10,
  'Reproductive Age': 0.20,
  'Medical History': 0.10,
};

export function computeAuroraScore(profile) {
  const dims = computeDimensions(profile);
  let score = 0;
  for (const [dim, weight] of Object.entries(weights)) {
    score += (dims[dim] || 0) * weight;
  }
  return Math.round(score);
}

export function getScoreLabel(score) {
  if (score >= 76) return 'Excellent';
  if (score >= 51) return 'Good';
  if (score >= 31) return 'Fair';
  return 'Poor';
}

export function computePathwayFit(profile, pathwayId) {
  const goalFits = {
    'Conceive': { natural: 85, iui: 70, ivf: 75, freeze: 30, donor: 45, surrogate: 25 },
    'Freeze eggs': { natural: 20, iui: 15, ivf: 40, freeze: 95, donor: 25, surrogate: 15 },
    'Explore options': { natural: 80, iui: 65, ivf: 70, freeze: 60, donor: 50, surrogate: 35 },
    'In treatment': { natural: 40, iui: 60, ivf: 85, freeze: 50, donor: 55, surrogate: 40 },
    'Donor/surrogacy': { natural: 20, iui: 30, ivf: 55, freeze: 25, donor: 90, surrogate: 85 },
  };
  const base = goalFits[profile.goal]?.[pathwayId] || 50;
  const ageMod = profile.age === '41+' ? -10 : profile.age === 'Under 30' ? 5 : 0;
  return Math.max(0, Math.min(100, base + ageMod));
}
