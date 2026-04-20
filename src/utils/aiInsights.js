// Mock AI analysis generator — deterministic, but crafted to feel LLM-generated.
// Produces personalized summary, insights, and pathway reasoning from profile + biomarkers.

const pick = (arr, seed = 0) => arr[seed % arr.length];

function biomarkerInsight(marker, profile) {
  // Generate a specific, numerical insight for a given biomarker
  const name = marker.name;
  if (name === 'Vitamin D' && marker.status === 'critical') {
    return {
      type: 'warning',
      title: 'Vitamin D significantly below optimal',
      text: `Your level of ${marker.value} ${marker.unit} is well under the 30 ${marker.unit} threshold. Research links sub-30 levels to a 15–25% reduction in implantation rates. A typical protocol is 2000–4000 IU daily for 8–12 weeks, then retest.`,
      priority: 9,
    };
  }
  if (name === 'TSH' && marker.status === 'attention') {
    return {
      type: 'data',
      title: 'Thyroid trending upward',
      text: `Your TSH has risen from ${marker.trend[0]} to ${marker.value} ${marker.unit} over 5 months. Most reproductive endocrinologists target TSH under 2.5 mIU/L before IVF. Worth a follow-up panel to rule out subclinical hypothyroidism.`,
      priority: 8,
    };
  }
  if (name === 'AMH' && marker.status === 'good') {
    return {
      type: 'positive',
      title: 'AMH supports strong ovarian reserve',
      text: `At ${marker.value} ${marker.unit}, your AMH is in the upper-normal range for your age bracket. This predicts a robust response to stimulation — typically 12+ mature eggs per IVF cycle at your age.`,
      priority: 7,
    };
  }
  if (name === 'FSH' && marker.status === 'good') {
    return {
      type: 'positive',
      title: 'FSH indicates healthy egg quality',
      text: `Your Day-3 FSH of ${marker.value} ${marker.unit} is comfortably below the 10 mIU/mL threshold, a favorable sign for both spontaneous conception and stimulation response.`,
      priority: 5,
    };
  }
  if (name === 'BMI' && marker.status === 'good') {
    return {
      type: 'positive',
      title: 'BMI in optimal range',
      text: `Your BMI of ${marker.value} is within the 18.5–24.9 target. This is associated with higher live birth rates across all treatment pathways.`,
      priority: 4,
    };
  }
  if (name === 'AFC' && marker.status === 'good') {
    return {
      type: 'positive',
      title: 'Antral follicle count is reassuring',
      text: `An AFC of ${marker.value} aligns with your AMH and suggests a well-synchronized cohort for retrieval. Your RE should be able to predict stimulation outcomes with good accuracy.`,
      priority: 6,
    };
  }
  return null;
}

function profileInsight(profile) {
  const out = [];

  if (profile.concern === 'Cost') {
    out.push({
      type: 'suggestion',
      title: 'Donor-funded freezing is your top cost-saver',
      text: 'Given cost is your primary concern, the donor-funded pathway could eliminate $8K–$18K in out-of-pocket fees in exchange for sharing half your retrieval. Programs like Cofertility make this straightforward if you qualify.',
      priority: 10,
    });
  }

  if ((profile.age === '35–37' || profile.age === '38–40') && profile.goal === 'Freeze eggs') {
    out.push({
      type: 'warning',
      title: 'Timing consideration for egg freezing',
      text: `At ${profile.age}, egg quality declines roughly 2–3% per month. Each cycle also yields fewer usable eggs — industry data suggests 2 cycles at this age to match 1 cycle under 35. Starting within 60–90 days is recommended.`,
      priority: 9,
    });
  }

  if (profile.timeline === 'Now' && (profile.age === '38–40' || profile.age === '41+')) {
    out.push({
      type: 'warning',
      title: 'Timeline + age favor direct-to-IVF',
      text: 'With your timeline and age bracket, the cumulative success of trying naturally or IUI for 6 months often doesn\'t justify the delay. Most REs at this stage recommend skipping to IVF with a fertility workup in the first 30 days.',
      priority: 8,
    });
  }

  if (profile.cycles === 'Irregular' || profile.cycles === 'Very light or absent') {
    out.push({
      type: 'data',
      title: 'Cycle pattern suggests PCOS workup',
      text: 'Irregular or absent cycles can indicate PCOS, hypothalamic amenorrhea, or thyroid involvement. A workup including AMH, testosterone, prolactin, and a pelvic ultrasound will clarify the cause and inform protocol choice.',
      priority: 7,
    });
  }

  if (profile.insurance === "Some coverage, don't understand it") {
    out.push({
      type: 'suggestion',
      title: 'Unlock hidden insurance value',
      text: 'Many plans cover diagnostic testing (including AMH, HSG, and semen analysis) even when they exclude treatment. Pulling your Summary of Benefits and scanning for "infertility diagnosis" codes can save $1K–$3K before you spend anything.',
      priority: 6,
    });
  }

  if (profile.partner === 'Solo') {
    out.push({
      type: 'suggestion',
      title: 'Solo-parenthood considerations',
      text: 'For solo parenthood, donor sperm + IUI or IVF is most common. Major sperm banks (Seattle Sperm Bank, California Cryobank) offer extensive screening and allow you to filter by donor characteristics. Legal consultation for parental rights varies by state.',
      priority: 6,
    });
  }

  return out;
}

function generateSummary(profile, biomarkers, score) {
  const criticalMarkers = biomarkers.filter(m => m.status === 'critical').map(m => m.name);
  const attentionMarkers = biomarkers.filter(m => m.status === 'attention').map(m => m.name);

  const lead = score >= 76
    ? `Your biomarkers tell a strong story — an Eve Score of ${score} places you in the top tier for your age group.`
    : score >= 51
      ? `Your Eve Score of ${score} reflects a generally healthy reproductive profile with a few areas to optimize.`
      : `Your Eve Score of ${score} indicates several modifiable factors that, if addressed, could meaningfully improve outcomes.`;

  const markerNote = criticalMarkers.length > 0
    ? ` The one area requiring attention is ${criticalMarkers.join(', ')}, which is actionable over 8–12 weeks.`
    : attentionMarkers.length > 0
      ? ` ${attentionMarkers.join(', ')} is worth a closer look, but nothing is alarming.`
      : ' None of your biomarkers are out of range.';

  const pathCue = profile.goal === 'Freeze eggs'
    ? ` For your egg-freezing goal, your ovarian reserve markers (AMH, AFC) are the most predictive — and both look favorable.`
    : profile.goal === 'Conceive'
      ? ` Given your goal to conceive, your cycle regularity and hormonal balance are the key levers.`
      : profile.goal === 'In treatment'
        ? ` Since you're already in treatment, this analysis is most useful as a second opinion on your current trajectory.`
        : ` Your combination of age and timeline gives you flexibility to optimize before committing to a pathway.`;

  return lead + markerNote + pathCue;
}

function generateWelcomeSummary(profile) {
  const timelineCue = profile.timeline === 'Now'
    ? "Since you're looking to start now, the most useful next step is usually a baseline fertility panel — it takes 5–10 days and costs around $179."
    : profile.timeline === 'Within 6 months'
      ? "You have a comfortable window to gather baseline data and build a plan before making any big decisions."
      : "With your timeline, you have time to do this thoughtfully. Start with a baseline panel whenever you're ready.";

  const goalCue = profile.goal === 'Freeze eggs'
    ? " For egg freezing specifically, your AMH and AFC are the two most predictive markers — worth prioritizing."
    : profile.goal === 'Conceive'
      ? " For conception, knowing your cycle regularity and baseline hormones gives you a head start with any provider."
      : "";

  return `Welcome to Eve. I've built an initial view from your profile — but the picture gets sharper once you add some biomarkers. ${timelineCue}${goalCue}`;
}

function generatePathwayReasoning(profile, biomarkers) {
  const amh = biomarkers.find(m => m.name === 'AMH');
  const vitD = biomarkers.find(m => m.name === 'Vitamin D');
  // Empty-biomarker fallback — reasoning is profile-only, no numerical references
  if (!amh) {
    return {
      natural: `Given your age bracket (${profile.age}), natural conception often has favorable odds — especially with regular cycles. A basic workup can confirm.`,
      iui: `IUI is often a reasonable bridge between natural conception and IVF. Most people try 3 cycles before considering next steps.`,
      ivf: `IVF tends to offer the highest per-cycle success rate — but the right protocol depends heavily on your ovarian reserve markers (AMH, AFC), which we don't have yet.`,
      freeze: `Egg freezing is time-sensitive. A baseline AMH and AFC will tell you how many cycles you'd likely need at your age.`,
      splitFreeze: `Donor-funded freezing could match the quality of a self-pay cycle at $0 out of pocket, if you meet the agency's eligibility criteria (typically age 21–32, good health).`,
      donor: `Donor eggs are typically considered when ovarian reserve is severely diminished or after repeated IVF failure.`,
      surrogate: `Gestational surrogacy is most commonly chosen for medical inability to carry, not as a first-line option.`,
    };
  }

  return {
    natural: `Given your age bracket (${profile.age}) and regular cycles, natural conception has favorable odds — particularly in the first 6 months.`,
    iui: `IUI is a reasonable bridge between natural conception and IVF. Most REs recommend 3 cycles before moving on if unsuccessful.`,
    ivf: `Your AMH of ${amh?.value} ${amh?.unit} predicts a strong stimulation response (~12+ mature eggs per cycle). IVF offers the highest success per cycle for your profile.${vitD?.status === 'critical' ? ' Consider addressing Vitamin D before starting.' : ''}`,
    freeze: `Egg freezing is time-sensitive. At your age, freezing within the next 6 months yields meaningfully better outcomes than waiting 2 years.`,
    splitFreeze: `Donor-funded freezing could match the quality of a self-pay cycle at $0 out of pocket, if you meet the agency's eligibility criteria (typically age 21–32, good health).`,
    donor: `Donor eggs are typically recommended when ovarian reserve is severely diminished or after repeated IVF failure. Your markers don't indicate this is necessary yet.`,
    surrogate: `Gestational surrogacy is most commonly chosen for medical inability to carry, not as a first-line option. Legal and logistical complexity is significant.`,
  };
}

export async function generateAnalysis(profile, biomarkers) {
  // Simulate realistic LLM latency
  await new Promise(r => setTimeout(r, 1400));

  // Empty-biomarker path: generate a welcoming summary and profile-only insights
  if (!biomarkers || biomarkers.length === 0) {
    const profileOnly = profileInsight(profile);
    // Add a universal "let's get your baseline" insight at the top
    const baselineInsight = {
      type: 'suggestion',
      title: 'A baseline unlocks everything',
      text: 'Adding a few test results — even just AMH, FSH, and AFC — transforms this from a general guide into a plan tailored to you. Most people start with an at-home fertility panel ($179) before ever stepping into a clinic.',
      priority: 10,
    };
    return {
      summary: generateWelcomeSummary(profile),
      insights: [baselineInsight, ...profileOnly.slice(0, 3)],
      pathwayReasoning: generatePathwayReasoning(profile, []),
    };
  }

  // Compute insights from both biomarker and profile sources
  const biomarkerInsights = biomarkers.map(m => biomarkerInsight(m, profile)).filter(Boolean);
  const profileInsights = profileInsight(profile);
  const all = [...biomarkerInsights, ...profileInsights];

  // Sort by priority and keep top 4, ensuring at least one positive if available
  const sorted = all.sort((a, b) => b.priority - a.priority);
  const positives = sorted.filter(i => i.type === 'positive');
  const nonPositive = sorted.filter(i => i.type !== 'positive');

  const insights = [];
  // Top 2 non-positive issues
  insights.push(...nonPositive.slice(0, 2));
  // Top 2 positives
  insights.push(...positives.slice(0, 2));
  // Fill remaining slots if we ended up short
  while (insights.length < 4 && sorted.length > insights.length) {
    const next = sorted.find(s => !insights.includes(s));
    if (!next) break;
    insights.push(next);
  }

  // Compute score for summary (duplicating logic lightly rather than importing to avoid cycles)
  const scoreLookup = { 'Under 30': 85, '30–34': 78, '35–37': 68, '38–40': 58, '41+': 45 };
  const roughScore = scoreLookup[profile.age] || 70;

  return {
    summary: generateSummary(profile, biomarkers, roughScore),
    insights: insights.slice(0, 4),
    pathwayReasoning: generatePathwayReasoning(profile, biomarkers),
  };
}
