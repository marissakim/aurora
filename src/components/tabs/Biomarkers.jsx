import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus } from 'lucide-react';
import { colors, cardStyle, gradients } from '../../theme';
import { sampleBiomarkers } from '../../data/biomarkers';
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

export default function Biomarkers() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {sampleBiomarkers.map(marker => {
          const isExpanded = expanded === marker.name;
          const chartData = marker.trend.map((v, i) => ({ month: months[i], value: v }));
          return (
            <div
              key={marker.name}
              onClick={() => setExpanded(isExpanded ? null : marker.name)}
              style={{ ...cardStyle, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
            >
              <p style={{ fontSize: 12, fontWeight: 600, color: colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 8px' }}>
                {marker.name}
              </p>
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
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
