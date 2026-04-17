import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Info, ChevronDown } from 'lucide-react';
import { colors, cardStyle, gradients } from '../../theme';
import { sampleBiomarkers, biomarkerEducation } from '../../data/biomarkers';
import StatusBadge from '../ui/StatusBadge';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];

function MiniSparkline({ data, status }) {
  const strokeColor = status === 'good' ? colors.sage : status === 'attention' ? '#E0901A' : '#D32F2F';
  const w = 80, h = 30, pad = 3;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

function EducationSection({ edu }) {
  if (!edu) return null;
  const sections = [
    { label: 'What it is', text: edu.whatItIs },
    { label: 'What your number means', text: edu.whatNumberMeans },
    { label: 'Why it matters for fertility', text: edu.whyItMatters },
    { label: 'What you can do', text: edu.whatYouCanDo },
  ];
  return (
    <div style={{
      background: colors.bg,
      borderRadius: 10,
      padding: 16,
      marginTop: 12,
    }}>
      <p style={{
        fontSize: 11, fontWeight: 700, color: colors.plum,
        textTransform: 'uppercase', letterSpacing: 0.5,
        margin: '0 0 4px',
      }}>
        {edu.fullName}
      </p>
      {sections.map(s => (
        <div key={s.label} style={{ marginTop: 10 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: colors.text, margin: '0 0 3px' }}>
            {s.label}
          </p>
          <p style={{ fontSize: 13, color: colors.textLight, margin: 0, lineHeight: 1.5 }}>
            {s.text}
          </p>
        </div>
      ))}
      <p style={{
        fontSize: 11, color: colors.textLight, margin: '12px 0 0',
        fontStyle: 'italic',
      }}>
        Retest cadence: {edu.testingCadence}
      </p>
    </div>
  );
}

export default function Biomarkers() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: colors.text, margin: 0 }}>Biomarkers</h2>
        <button style={{
          background: gradients.purpleRose,
          color: '#fff',
          border: 'none',
          padding: '10px 20px',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <Plus size={16} /> Log Results
        </button>
      </div>
      <p style={{ fontSize: 13, color: colors.textLight, margin: '0 0 20px' }}>
        Tap any marker to see the trend chart and learn what it means.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {sampleBiomarkers.map(marker => {
          const isExpanded = expanded === marker.name;
          const chartData = marker.trend.map((v, i) => ({ month: months[i], value: v }));
          const edu = biomarkerEducation[marker.name];
          return (
            <div
              key={marker.name}
              onClick={() => setExpanded(isExpanded ? null : marker.name)}
              style={{ ...cardStyle, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>
                  {marker.name}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: colors.textLight }}>
                  <Info size={12} />
                  <ChevronDown size={14} style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 28, fontWeight: 800, color: colors.text }}>{marker.value}</span>
                  <span style={{ fontSize: 14, color: colors.textLight, marginLeft: 4 }}>{marker.unit}</span>
                </div>
                <MiniSparkline data={marker.trend} status={marker.status} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <StatusBadge status={marker.status} />
                <span style={{ fontSize: 12, color: colors.textLight }}>Normal: {marker.range}</span>
              </div>

              {isExpanded && (
                <div style={{ marginTop: 16, borderTop: `1px solid ${colors.border}`, paddingTop: 16 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: colors.textLight, margin: '0 0 8px' }}>5-Month Trend</p>
                  <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: colors.textLight }} />
                      <YAxis tick={{ fontSize: 12, fill: colors.textLight }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke={colors.plum} strokeWidth={2} dot={{ r: 4, fill: colors.plum }} />
                    </LineChart>
                  </ResponsiveContainer>
                  <EducationSection edu={edu} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
