import { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { FlaskConical, GitCompare, MapPin, DollarSign, Zap, Calendar, TrendingUp, AlertCircle, Sparkles, RefreshCw, Video, ArrowRight } from 'lucide-react';
import { colors, gradients, cardStyle } from '../../theme';
import { computeAuroraScore, computeDimensions, getScoreLabel } from '../../utils/scoring';
import { generateAnalysis } from '../../utils/aiInsights';
import { sampleBiomarkers } from '../../data/biomarkers';
import ProgressRing from '../ui/ProgressRing';
import Card from '../ui/Card';

const quickActions = [
  { label: 'Log New Results', icon: FlaskConical, tab: 'markers' },
  { label: 'Compare Pathways', icon: GitCompare, tab: 'pathways' },
  { label: 'Find a Clinic', icon: MapPin, tab: 'clinics' },
  { label: 'Cost Estimator', icon: DollarSign, tab: 'costs' },
];

const nextSteps = [
  { text: 'Start Vitamin D supplementation (2000 IU daily)', due: 'This week' },
  { text: 'Book consultation with top-rated RE in your area', due: 'Within 2 weeks' },
  { text: 'Review and compare IVF clinic costs', due: 'This month' },
];

const insightTheme = {
  positive: { icon: TrendingUp, bg: '#E8F5E9', color: '#2E7D32' },
  warning: { icon: AlertCircle, bg: '#FFF3E0', color: '#E0901A' },
  suggestion: { icon: Zap, bg: '#F3E8FF', color: '#5B3E8A' },
  data: { icon: Calendar, bg: '#E0F2F1', color: '#3A8B8B' },
};

function Shimmer({ width = '100%', height = 16, style = {} }) {
  return (
    <div style={{
      width, height, borderRadius: 6,
      background: 'linear-gradient(90deg, #EEE9F2 0%, #F8F5FA 50%, #EEE9F2 100%)',
      backgroundSize: '200% 100%',
      animation: 'aurora-shimmer 1.4s ease-in-out infinite',
      ...style,
    }} />
  );
}

export default function MyIndex({ profile, onNavigate }) {
  const score = computeAuroraScore(profile);
  const scoreLabel = getScoreLabel(score);
  const dims = computeDimensions(profile);
  const radarData = Object.entries(dims).map(([dim, val]) => ({ dimension: dim, value: val, fullMark: 100 }));

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenCount, setRegenCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    generateAnalysis(profile, sampleBiomarkers).then(result => {
      if (!cancelled) {
        setAnalysis(result);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [profile, regenCount]);

  return (
    <div>
      {/* Score + Radar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 24 }}>
        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 28 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 12px' }}>
            Your Aurora Score
          </p>
          <ProgressRing score={score} />
          <p style={{ fontSize: 20, fontWeight: 700, color: colors.plum, margin: '12px 0 4px' }}>{scoreLabel}</p>
          <p style={{ fontSize: 13, color: colors.textLight, margin: 0 }}>
            Based on 6 biomarkers &middot; Updated 2 days ago
          </p>
        </Card>

        <Card style={{ padding: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 8px', textAlign: 'center' }}>
            Health Dimensions
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={colors.border} />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: colors.textLight }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar dataKey="value" stroke={colors.plum} fill={colors.plum} fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Aurora Analysis (AI) */}
      <Card style={{
        padding: 24,
        marginBottom: 24,
        background: 'linear-gradient(135deg, #FAF7FC 0%, #FDF4F5 100%)',
        border: `1px solid ${colors.border}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: gradients.purpleRose,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.text, margin: 0 }}>Aurora Analysis</h3>
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
            <RefreshCw size={14} color={colors.textLight} style={loading ? { animation: 'aurora-spin 1s linear infinite' } : {}} />
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
                animation: 'aurora-fade-in 0.4s ease-out both',
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

      {/* Next Steps */}
      <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.text, margin: '0 0 12px' }}>Next Steps</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {nextSteps.map((step, i) => (
          <div key={i} style={{
            ...cardStyle,
            background: gradients.purpleRose,
            border: 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6,
                border: '2px solid rgba(255,255,255,0.5)',
                flexShrink: 0,
              }} />
              <p style={{ fontSize: 14, fontWeight: 500, color: '#fff', margin: 0 }}>{step.text}</p>
            </div>
            <span style={{
              fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)',
              whiteSpace: 'nowrap', marginLeft: 12,
            }}>
              {step.due}
            </span>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <p style={{ fontSize: 11, color: colors.textLight, textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
        Aurora Analysis is AI-generated decision support, not a medical diagnosis. Always consult a reproductive endocrinologist for clinical decisions.
      </p>
    </div>
  );
}
