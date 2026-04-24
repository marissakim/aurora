import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Info, ChevronDown, FlaskConical, Video, ArrowRight } from 'lucide-react';
import { colors, cardStyle, fonts } from '../../theme';
import { biomarkerEducation } from '../../data/biomarkers';
import StatusBadge from '../ui/StatusBadge';
import AddBiomarkersModal from '../AddBiomarkersModal';
import EveKitModal from '../EveKitModal';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];

function MiniSparkline({ data, status }) {
  const strokeColor = status === 'good' ? colors.sage : status === 'attention' ? '#E0901A' : '#D32F2F';
  const w = 80, h = 30, pad = 3;
  if (!data || data.length === 0) return null;
  // Single data point — draw a dot instead of a line
  if (data.length === 1) {
    return (
      <svg width={w} height={h} style={{ display: 'block' }}>
        <circle cx={w / 2} cy={h / 2} r="3" fill={strokeColor} />
      </svg>
    );
  }
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

// Friendly empty state — trusted-guide tone, clear CTAs, not pushy.
function EmptyBiomarkers({ onAdd, onOrderKit }) {
  return (
    <div style={{
      ...cardStyle,
      padding: 32,
      textAlign: 'center',
      background: 'linear-gradient(135deg, #FFFFFF 0%, #F7EBE6 100%)',
      border: `1px solid ${colors.border}`,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: colors.bg,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
      }}>
        <FlaskConical size={26} color={colors.plum} />
      </div>
      <h3 style={{
        fontSize: 22, fontFamily: fonts.serif, fontWeight: 400,
        color: colors.text, margin: '0 0 8px',
        letterSpacing: -0.3,
      }}>
        Let&apos;s add your first results
      </h3>
      <p style={{
        fontSize: 14, color: colors.textLight,
        margin: '0 auto 20px', maxWidth: 480, lineHeight: 1.6,
      }}>
        Your biomarkers help Eve give you personalized insights and a plan that reflects
        where you actually are. Enter what you have, or order an Eve Kit — you&apos;ll
        add your results here when the lab emails them.
      </p>
      <div style={{
        display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap',
      }}>
        <button
          onClick={onAdd}
          style={{
            background: colors.spice,
            color: '#FBF9F5',
            border: 'none',
            padding: '12px 24px',
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: fonts.family,
            display: 'inline-flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 16px rgba(122, 66, 50, 0.25)',
          }}
        >
          <Plus size={16} /> Add my results
        </button>
        <button
          onClick={onOrderKit}
          style={{
            background: '#fff',
            color: colors.spice,
            border: `1px solid ${colors.spice}`,
            padding: '12px 22px',
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: fonts.family,
          }}
        >
          Order an Eve Kit
        </button>
      </div>
    </div>
  );
}

export default function Biomarkers({ profile = {}, biomarkers = [], onUpdateBiomarkers, onKitOrdered, onNavigate }) {
  const [expanded, setExpanded] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showKitModal, setShowKitModal] = useState(false);

  // Empty state: prompt user to add results or find testing
  if (biomarkers.length === 0) {
    return (
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: colors.text, margin: '0 0 4px' }}>
          Biomarkers
        </h2>
        <p style={{ fontSize: 13, color: colors.textLight, margin: '0 0 20px' }}>
          The numbers that tell your fertility story.
        </p>
        <EmptyBiomarkers
          onAdd={() => setShowAddModal(true)}
          onOrderKit={() => setShowKitModal(true)}
        />
        {/* Tertiary: virtual care for help understanding what to test */}
        <p style={{
          textAlign: 'center', fontSize: 13, color: colors.textLight,
          marginTop: 16, lineHeight: 1.6,
        }}>
          Want to talk to a provider first? <button
            onClick={() => onNavigate?.('clinics', { filter: 'Virtual Care' })}
            style={{
              background: 'none', border: 'none', padding: 0,
              color: colors.teal, fontWeight: 600, cursor: 'pointer',
              textDecoration: 'underline', fontFamily: fonts.family, fontSize: 13,
            }}
          >Browse virtual care options →</button>
        </p>
        {showAddModal && (
          <AddBiomarkersModal
            existing={biomarkers}
            onClose={() => setShowAddModal(false)}
            onSave={onUpdateBiomarkers}
          />
        )}
        {showKitModal && (
          <EveKitModal
            profile={profile}
            onClose={() => setShowKitModal(false)}
            onOrdered={kit => onKitOrdered?.(kit)}
          />
        )}
      </div>
    );
  }

  // Has biomarkers — show interpretation banner if any need attention
  const needsInterpretation = biomarkers.some(b => b.status !== 'good');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: colors.text, margin: 0 }}>Biomarkers</h2>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            background: colors.spice,
            color: '#FBF9F5',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: fonts.family,
            boxShadow: '0 3px 12px rgba(122, 66, 50, 0.25)',
          }}
        >
          <Plus size={16} /> Log Results
        </button>
      </div>
      <p style={{ fontSize: 13, color: colors.textLight, margin: '0 0 16px' }}>
        Tap any marker to see the trend chart and learn what it means.
      </p>

      {/* Interpretation banner — shown when any marker needs attention */}
      {needsInterpretation && (
        <div
          onClick={() => onNavigate?.('clinics', { filter: 'Virtual Care' })}
          style={{
            background: 'linear-gradient(135deg, #E0F2F1 0%, #FFF8E1 100%)',
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: colors.teal,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Video size={16} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: colors.text, margin: '0 0 2px' }}>
              Want help understanding these results?
            </p>
            <p style={{ fontSize: 12, color: colors.textLight, margin: 0, lineHeight: 1.4 }}>
              A virtual consult ($25–$250) can walk you through what to do next.
            </p>
          </div>
          <ArrowRight size={16} color={colors.textLight} style={{ flexShrink: 0 }} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {biomarkers.map(marker => {
          const isExpanded = expanded === marker.name;
          const edu = biomarkerEducation[marker.name];
          // Pad trend to 5 points for chart display if fewer exist
          const padded = marker.trend.length < 5
            ? Array(5 - marker.trend.length).fill(null).concat(marker.trend)
            : marker.trend.slice(-5);
          const chartData = padded.map((v, i) => ({ month: months[i], value: v }));
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
                  {marker.trend.length > 1 ? (
                    <>
                      <p style={{ fontSize: 13, fontWeight: 600, color: colors.textLight, margin: '0 0 8px' }}>
                        Trend ({marker.trend.length} point{marker.trend.length > 1 ? 's' : ''})
                      </p>
                      <ResponsiveContainer width="100%" height={150}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                          <XAxis dataKey="month" tick={{ fontSize: 12, fill: colors.textLight }} />
                          <YAxis tick={{ fontSize: 12, fill: colors.textLight }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke={colors.plum} strokeWidth={2} dot={{ r: 4, fill: colors.plum }} connectNulls />
                        </LineChart>
                      </ResponsiveContainer>
                    </>
                  ) : (
                    <p style={{ fontSize: 13, color: colors.textLight, margin: '0 0 4px', fontStyle: 'italic' }}>
                      Add more results over time to see your trend.
                    </p>
                  )}
                  <EducationSection edu={edu} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <AddBiomarkersModal
          existing={biomarkers}
          onClose={() => setShowAddModal(false)}
          onSave={onUpdateBiomarkers}
        />
      )}
      {showKitModal && (
        <EveKitModal
          profile={profile}
          onClose={() => setShowKitModal(false)}
          onOrdered={kit => onKitOrdered?.(kit)}
        />
      )}
    </div>
  );
}
