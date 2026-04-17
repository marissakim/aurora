import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { FlaskConical, GitCompare, MapPin, DollarSign, Zap, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { colors, gradients, cardStyle } from '../../theme';
import { computeAuroraScore, computeDimensions, getScoreLabel } from '../../utils/scoring';
import ProgressRing from '../ui/ProgressRing';
import Card from '../ui/Card';

const quickActions = [
  { label: 'Log New Results', icon: FlaskConical, tab: 'markers' },
  { label: 'Compare Pathways', icon: GitCompare, tab: 'pathways' },
  { label: 'Find a Clinic', icon: MapPin, tab: 'clinics' },
  { label: 'Cost Estimator', icon: DollarSign, tab: 'costs' },
];

const insights = [
  { type: 'positive', icon: TrendingUp, text: 'Your AMH levels are within the healthy range, indicating good ovarian reserve.', bg: '#E8F5E9', color: '#2E7D32' },
  { type: 'warning', icon: AlertCircle, text: 'Your Vitamin D is below optimal. Consider supplementation to improve implantation rates.', bg: '#FFF3E0', color: '#E0901A' },
  { type: 'suggestion', icon: Zap, text: 'Based on your profile, IVF has the highest projected success rate for your goals.', bg: '#F3E8FF', color: '#5B3E8A' },
  { type: 'data', icon: Calendar, text: 'Your TSH is trending upward — schedule a follow-up thyroid panel within 2 weeks.', bg: '#E0F2F1', color: '#3A8B8B' },
];

const nextSteps = [
  { text: 'Start Vitamin D supplementation (2000 IU daily)', due: 'This week' },
  { text: 'Book consultation with top-rated RE in your area', due: 'Within 2 weeks' },
  { text: 'Review and compare IVF clinic costs', due: 'This month' },
];

export default function MyIndex({ profile, onNavigate }) {
  const score = computeAuroraScore(profile);
  const scoreLabel = getScoreLabel(score);
  const dims = computeDimensions(profile);
  const radarData = Object.entries(dims).map(([dim, val]) => ({ dimension: dim, value: val, fullMark: 100 }));

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
      <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.text, margin: '0 0 12px' }}>Key Insights</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 24 }}>
        {insights.map((insight, i) => {
          const Icon = insight.icon;
          return (
            <div key={i} style={{ ...cardStyle, background: insight.bg, border: 'none', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <Icon size={20} color={insight.color} style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 14, color: insight.color, margin: 0, lineHeight: 1.5 }}>{insight.text}</p>
            </div>
          );
        })}
      </div>

      {/* Next Steps */}
      <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.text, margin: '0 0 12px' }}>Next Steps</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
    </div>
  );
}
