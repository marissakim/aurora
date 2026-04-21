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

export function computeEveScore(profile) {
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

// Short, user-facing explanation for each factor value.
// Keeps the score honest ("here's what your answer actually means") and
// avoids the decorative-dashboard feel of the old radar chart.
const factorNotes = {
  age: {
    'Under 30': 'Peak fertility years — your biggest asset',
    '30–34': 'Still strong ovarian reserve on average',
    '35–37': 'Reserve starts to decline — often a good window to plan',
    '38–40': 'Reserve and egg quality drop faster here',
    '41+': 'Meaningful decline — time is your most important variable',
  },
  cycles: {
    'Regular (24–35 days)': 'A strong signal of regular ovulation',
    'Irregular': 'Worth investigating — often points to treatable causes',
    'Very light or absent': 'Warrants a workup — several causes are reversible',
    'Not sure': 'Tracking for 2–3 cycles would clarify a lot',
  },
  conditions: {
    'None that I know of': 'A clean baseline to build on',
    'PCOS': 'Manageable with the right protocol — often improves with treatment',
    'Endometriosis': 'Treatable — laparoscopy often improves conception odds',
    'Low ovarian reserve': 'Shifts priorities — earlier and more aggressive treatment',
    'Other / not sure': 'A full workup will clarify what\'s at play',
  },
  testing: {
    'Not yet': 'Adding biomarkers unlocks a meaningfully sharper picture',
    'Yes, basic bloodwork': 'A solid start — extended panels add precision',
    'Yes, full workup': 'You have what most clinicians would want to see',
    'Yes, plus genetic screening': 'You have the most complete picture possible',
  },
};

function biomarkerNote(marker) {
  if (marker.status === 'good') {
    return `${marker.value} ${marker.unit} — within the healthy ${marker.range} range`;
  }
  const direction = parseFloat(marker.value) < parseFloat(marker.range.split(/[–-]/)[0]) ? 'below' : 'above';
  return `${marker.value} ${marker.unit} — ${direction} the ${marker.range} target`;
}

const statusToScore = { good: 88, attention: 55, critical: 32 };

/**
 * Returns a list of factors that contribute to the Eve Score, with individual
 * 0-100 scores, brief notes, and a source tag ('profile' | 'biomarker').
 * Used by the My Index "What's driving your score" breakdown.
 */
export function computeScoreFactors(profile = {}, biomarkers = []) {
  const factors = [];

  if (profile.age) {
    factors.push({
      key: 'age',
      label: 'Age',
      value: profile.age,
      score: ageScores[profile.age] || 70,
      note: factorNotes.age[profile.age] || 'Reflects typical fertility at this stage',
      source: 'profile',
    });
  }

  if (profile.cycles) {
    factors.push({
      key: 'cycles',
      label: 'Cycle regularity',
      value: profile.cycles,
      score: cycleScores[profile.cycles] || 65,
      note: factorNotes.cycles[profile.cycles] || '',
      source: 'profile',
    });
  }

  if (profile.conditions) {
    factors.push({
      key: 'conditions',
      label: 'Conditions',
      value: profile.conditions,
      score: conditionScores[profile.conditions] || 70,
      note: factorNotes.conditions[profile.conditions] || '',
      source: 'profile',
    });
  }

  if (profile.testing) {
    factors.push({
      key: 'testing',
      label: 'Testing history',
      value: profile.testing,
      score: testingScores[profile.testing] || 60,
      note: factorNotes.testing[profile.testing] || '',
      source: 'profile',
    });
  }

  for (const m of biomarkers) {
    factors.push({
      key: `bio-${m.name}`,
      label: m.name,
      value: `${m.value} ${m.unit}`,
      score: statusToScore[m.status] || 70,
      note: biomarkerNote(m),
      source: 'biomarker',
      status: m.status,
    });
  }

  return factors;
}

export function computePathwayFit(profile, pathwayId) {
  const goalFits = {
    'Conceive': { natural: 85, iui: 70, ivf: 75, freeze: 30, splitFreeze: 25, donor: 45, surrogate: 25 },
    'Freeze eggs': { natural: 20, iui: 15, ivf: 40, freeze: 95, splitFreeze: 85, donor: 25, surrogate: 15 },
    'Explore options': { natural: 80, iui: 65, ivf: 70, freeze: 60, splitFreeze: 55, donor: 50, surrogate: 35 },
    'In treatment': { natural: 40, iui: 60, ivf: 85, freeze: 50, splitFreeze: 40, donor: 55, surrogate: 40 },
    'Donor/surrogacy': { natural: 20, iui: 30, ivf: 55, freeze: 25, splitFreeze: 30, donor: 90, surrogate: 85 },
  };
  const base = goalFits[profile.goal]?.[pathwayId] || 50;
  let ageMod = profile.age === '41+' ? -10 : profile.age === 'Under 30' ? 5 : 0;
  // Donor-funded freezing has strict age eligibility (typically 21–32)
  if (pathwayId === 'splitFreeze') {
    if (profile.age === '38–40' || profile.age === '41+') ageMod -= 40;
    else if (profile.age === '35–37') ageMod -= 15;
    else if (profile.age === 'Under 30') ageMod += 10;
  }
  // Cost-concerned users get a big boost for the free option
  if (pathwayId === 'splitFreeze' && profile.concern === 'Cost') ageMod += 15;
  return Math.max(0, Math.min(100, base + ageMod));
}
