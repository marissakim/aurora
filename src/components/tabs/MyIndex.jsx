import { useState, useEffect } from 'react';
import { FlaskConical, GitCompare, MapPin, DollarSign, Zap, Calendar, TrendingUp, AlertCircle, Sparkles, RefreshCw, Video, ArrowRight, Plus } from 'lucide-react';
import { colors, gradients, cardStyle, fonts } from '../../theme';
import { computeEveScore, computeScoreFactors, getScoreLabel } from '../../utils/scoring';
import { generateAnalysis } from '../../utils/aiInsights';
import ProgressRing from '../ui/ProgressRing';
import Card from '../ui/Card';

const quickActions = [
  { label: 'Log New Results', icon: FlaskConical, tab: 'markers' },
  { label: 'Compare Pathways', icon: GitCompare, tab: 'pathways' },
  { label: 'Find a Clinic', icon: MapPin, tab: 'clinics' },
  { label: 'Cost Estimator', icon: DollarSign, tab: 'costs' },
];

const insightTheme = {
  positive: { icon: TrendingUp, bg: '#E8F5E9', color: '#2E7D32' },
  warning: { icon: AlertCircle, bg: '#FFF3E0', color: '#E0901A' },
  suggestion: { icon: Zap, bg: '#F0EAEC', color: '#3D2E3D' },
  data: { icon: Calendar, bg: '#E0F2F1', color: '#6B8F8F' },
};

// Horizontal-bar breakdown of factors contributing to the Eve Score.
// Replaces the old radar chart — more honest (every factor is driven by
// real input), more scannable, and naturally accommodates biomarkers
// as they're added.
function ScoreBreakdown({ factors, hasBiomarkers, onAddBiomarkers }) {
  const profileFactors = factors.filter(f => f.source === 'profile');
  const biomarkerFactors = factors.filter(f => f.source === 'biomarker');

  const barColor = score => {
    if (score >= 75) return colors.sage;
    if (score >= 55) return colors.gold;
    return colors.spice;
  };

  return (
    <Card style={{ padding: 22 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px' }}>
        What&apos;s driving your score
      </p>
      <p style={{ fontSize: 12, color: colors.textLight, margin: '0 0 16px' }}>
        Each factor is weighted and combined — your score moves as any of these change.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {profileFactors.map(f => (
          <FactorRow key={f.key} factor={f} barColor={barColor(f.score)} />
        ))}

        {biomarkerFactors.length > 0 && (
          <>
            <div style={{
              height: 1, background: colors.border, margin: '6px 0 2px',
            }} />
            <p style={{
              fontSize: 11, fontWeight: 700, color: colors.textLight,
              textTransform: 'uppercase', letterSpacing: 0.5, margin: 0,
            }}>
              From your biomarkers
            </p>
            {biomarkerFactors.map(f => (
              <FactorRow key={f.key} factor={f} barColor={barColor(f.score)} />
            ))}
          </>
        )}

        {!hasBiomarkers && (
          <div style={{
            background: colors.bg,
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 12, marginTop: 4,
          }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: colors.text, margin: '0 0 2px' }}>
                Biomarkers — not yet added
              </p>
              <p style={{ fontSize: 12, color: colors.textLight, margin: 0, lineHeight: 1.4 }}>
                Adding them typically shifts your score by ±10 points.
              </p>
            </div>
            <button
              onClick={onAddBiomarkers}
              style={{
                background: colors.spice,
                color: '#FBF9F5',
                border: 'none',
                padding: '8px 14px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: fonts.family,
                display: 'inline-flex', alignItems: 'center', gap: 4,
                whiteSpace: 'nowrap',
              }}
            >
              <Plus size={12} /> Add
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}

function FactorRow({ factor, barColor }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>{factor.label}</span>
          <span style={{ fontSize: 12, color: colors.textLight, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            · {factor.value}
          </span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: colors.text, flexShrink: 0, marginLeft: 8 }}>
          {factor.score}
        </span>
      </div>
      <div style={{
        height: 6, background: colors.border, borderRadius: 3, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${factor.score}%`,
          background: barColor,
          borderRadius: 3,
          transition: 'width 0.5s ease-out',
        }} />
      </div>
      {factor.note && (
        <p style={{ fontSize: 11, color: colors.textLight, margin: '4px 0 0', lineHeight: 1.4 }}>
          {factor.note}
        </p>
      )}
    </div>
  );
}

function Shimmer({ width = '100%', height = 16, style = {} }) {
  return (
    <div style={{
      width, height, borderRadius: 6,
      background: 'linear-gradient(90deg, #EEE9F2 0%, #F8F5FA 50%, #EEE9F2 100%)',
      backgroundSize: '200% 100%',
      animation: 'eve-shimmer 1.4s ease-in-out infinite',
      ...style,
    }} />
  );
}

export default function MyIndex({ profile, biomarkers = [], onNavigate }) {
  const score = computeEveScore(profile);
  const scoreLabel = getScoreLabel(score);
  const factors = computeScoreFactors(profile, biomarkers);
  const hasBiomarkers = biomarkers.length > 0;

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenCount, setRegenCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    generateAnalysis(profile, biomarkers).then(result => {
      if (!cancelled) {
        setAnalysis(result);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [profile, biomarkers, regenCount]);

  return (
    <div>
      {/* Score + Radar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 24 }}>
        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 28 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 12px' }}>
            Your Eve Score
          </p>
          <ProgressRing score={score} />
          <p style={{ fontSize: 20, fontWeight: 700, color: colors.plum, margin: '12px 0 4px' }}>{scoreLabel}</p>
          <p style={{ fontSize: 13, color: colors.textLight, margin: 0, textAlign: 'center' }}>
            {hasBiomarkers
              ? `Based on your profile and ${biomarkers.length} biomarker${biomarkers.length === 1 ? '' : 's'}`
              : 'Based on your profile so far'}
          </p>
          {profile.goal === 'Donor/surrogacy' && (
            <p style={{
              fontSize: 12, color: colors.textLight, margin: '10px 0 0',
              textAlign: 'center', fontStyle: 'italic', lineHeight: 1.5,
              maxWidth: 280,
            }}>
              This reflects your baseline reproductive health. For a donor-egg path, your uterine health and thyroid matter more than your score suggests.
            </p>
          )}
          {!hasBiomarkers && profile.goal !== 'Donor/surrogacy' && (
            <button
              onClick={() => onNavigate?.('markers')}
              style={{
                marginTop: 12,
                background: 'none',
                color: colors.spice,
                border: `1px solid ${colors.spice}`,
                padding: '8px 16px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Add biomarkers to sharpen your score →
            </button>
          )}
        </Card>

        <ScoreBreakdown
          factors={factors}
          hasBiomarkers={hasBiomarkers}
          onAddBiomarkers={() => onNavigate?.('markers')}
        />
      </div>

      {/* Eve Analysis (AI) */}
      <Card style={{
        padding: 24,
        marginBottom: 24,
        background: 'linear-gradient(135deg, #FBF9F5 0%, #F7EBE6 100%)',
        border: `1px solid ${colors.border}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: gradients.spice,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(122, 66, 50, 0.2)',
            }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.text, margin: 0 }}>Eve Analysis</h3>
              <p style={{ fontSize: 11, fontWeight: 600, color: colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5, margin: '2px 0 0' }}>
                AI-personalized for your profile
              </p>
            </div>
          </div>
          <button
            onClick={() => setRegenCount(c => c + 1)}
            disabled={loading}
            title="Regenerate"
            style={{
              background: 'none', border: `1px solid ${colors.border}`,
              borderRadius: 8, padding: 6, cursor: loading ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: loading ? 0.4 : 1,
            }}
          >
            <RefreshCw size={14} color={colors.textLight} style={loading ? { animation: 'eve-spin 1s linear infinite' } : {}} />
          </button>
        </div>

        {loading ? (
          <div>
            <Shimmer width="90%" height={14} style={{ marginBottom: 8 }} />
            <Shimmer width="95%" height={14} style={{ marginBottom: 8 }} />
            <Shimmer width="70%" height={14} />
          </div>
        ) : (
          <p style={{ fontSize: 14, color: colors.text, lineHeight: 1.6, margin: 0 }}>
            {analysis?.summary}
          </p>
        )}
      </Card>

      {/* Start Here — Virtual Care hero */}
      <div
        onClick={() => onNavigate('clinics', { filter: 'Virtual Care' })}
        style={{
          background: gradients.tealGold,
          borderRadius: 14,
          padding: 20,
          marginBottom: 24,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          boxShadow: '0 4px 16px rgba(58, 139, 139, 0.15)',
          transition: 'transform 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'rgba(255,255,255,0.25)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Video size={24} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#fff',
              background: 'rgba(255,255,255,0.25)',
              padding: '2px 8px', borderRadius: 6,
              textTransform: 'uppercase', letterSpacing: 0.5,
            }}>
              Start Here
            </span>
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>
            Not ready for a clinic? Start with a virtual consult.
          </h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', margin: 0, lineHeight: 1.4 }}>
            $25–$250 virtual consultations. Get answers in days, not weeks — without committing to a full clinic intake.
          </p>
        </div>
        <ArrowRight size={20} color="#fff" style={{ flexShrink: 0 }} />
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {quickActions.map(action => {
          const Icon = action.icon;
          return (
            <Card key={action.label} onClick={() => onNavigate(action.tab)} style={{ padding: 16, textAlign: 'center' }}>
              <Icon size={24} color={colors.plum} style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: colors.text, margin: 0 }}>{action.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Key Insights */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.text, margin: 0 }}>Key Insights</h3>
        <Sparkles size={14} color={colors.plum} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 24 }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ ...cardStyle, padding: 16, background: '#fff' }}>
              <Shimmer width="60%" height={14} style={{ marginBottom: 10 }} />
              <Shimmer width="100%" height={12} style={{ marginBottom: 6 }} />
              <Shimmer width="85%" height={12} />
            </div>
          ))
        ) : (
          analysis?.insights.map((insight, i) => {
            const theme = insightTheme[insight.type] || insightTheme.data;
            const Icon = theme.icon;
            return (
              <div key={i} style={{
                ...cardStyle,
                background: theme.bg,
                border: 'none',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                animation: 'eve-fade-in 0.4s ease-out both',
                animationDelay: `${i * 80}ms`,
              }}>
                <Icon size={20} color={theme.color} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  {insight.title && (
                    <p style={{ fontSize: 14, fontWeight: 700, color: theme.color, margin: '0 0 4px', lineHeight: 1.35 }}>
                      {insight.title}
                    </p>
                  )}
                  <p style={{ fontSize: 13, color: theme.color, margin: 0, lineHeight: 1.5, opacity: 0.9 }}>
                    {insight.text}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Disclaimer */}
      <p style={{ fontSize: 11, color: colors.textLight, textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
        Eve Analysis is AI-generated decision support, not a medical diagnosis. Always consult a reproductive endocrinologist for clinical decisions.
      </p>
    </div>
  );
}
