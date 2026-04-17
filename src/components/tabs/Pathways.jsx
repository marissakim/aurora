import { useState } from 'react';
import { colors, cardStyle, gradients } from '../../theme';
import { pathways as pathwayData } from '../../data/pathways';
import { computePathwayFit } from '../../utils/scoring';
import DonorIntakeModal from '../DonorIntakeModal';

export default function Pathways({ profile }) {
  const [expanded, setExpanded] = useState(null);
  const [showDonorIntake, setShowDonorIntake] = useState(false);

  const scored = pathwayData.map(p => ({
    ...p,
    fit: computePathwayFit(profile, p.id),
  })).sort((a, b) => b.fit - a.fit);

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: colors.text, margin: '0 0 8px' }}>Treatment Pathways</h2>
      <p style={{ fontSize: 14, color: colors.textLight, margin: '0 0 20px' }}>
        Ranked by your personalized fit score based on your profile.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {scored.map((p, i) => {
          const isExpanded = expanded === p.id;
          const fitColor = p.fit >= 70 ? colors.sage : p.fit >= 50 ? colors.gold : colors.textLight;

          return (
            <div
              key={p.id}
              onClick={() => setExpanded(isExpanded ? null : p.id)}
              style={{ ...cardStyle, cursor: 'pointer', position: 'relative' }}
            >
              {i === 0 && (
                <span style={{
                  position: 'absolute', top: -10, right: 16,
                  background: colors.gold, color: '#fff',
                  fontSize: 11, fontWeight: 700, padding: '3px 10px',
                  borderRadius: 8, textTransform: 'uppercase', letterSpacing: 0.5,
                }}>
                  Best Fit
                </span>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 28 }}>{p.icon}</span>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.text, margin: 0 }}>{p.title}</h3>
                    <p style={{ fontSize: 14, color: colors.textLight, margin: '4px 0 0' }}>{p.description}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'center', minWidth: 60 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    border: `3px solid ${fitColor}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 800, color: fitColor,
                  }}>
                    {p.fit}
                  </div>
                  <span style={{ fontSize: 11, color: colors.textLight, fontWeight: 600 }}>FIT</span>
                </div>
              </div>

              {isExpanded && (
                <div style={{ marginTop: 20, borderTop: `1px solid ${colors.border}`, paddingTop: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 20 }}>
                    {[
                      { label: 'Success Rate', value: p.successRate + (p.perCycle ? '/cycle' : '') },
                      { label: 'Timeframe', value: p.timeframe },
                      { label: 'Cost Range', value: p.costRange },
                      { label: 'Fit Score', value: `${p.fit}/100` },
                    ].map(stat => (
                      <div key={stat.label} style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 12, color: colors.textLight, textTransform: 'uppercase', fontWeight: 600, margin: '0 0 4px' }}>{stat.label}</p>
                        <p style={{ fontSize: 16, fontWeight: 700, color: colors.text, margin: 0 }}>{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <h4 style={{ fontSize: 14, fontWeight: 700, color: colors.plum, margin: '0 0 12px' }}>Your Personalized Steps</h4>
                  <ol style={{ margin: 0, paddingLeft: 20 }}>
                    {p.steps.map((step, j) => (
                      <li key={j} style={{ fontSize: 14, color: colors.text, marginBottom: 8, lineHeight: 1.5 }}>{step}</li>
                    ))}
                  </ol>

                  {p.isDonorProgram ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowDonorIntake(true); }}
                      style={{
                        marginTop: 16,
                        background: gradients.roseGold,
                        color: '#fff',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                        width: '100%',
                      }}
                    >
                      💝 Start Eligibility Intake (2 min)
                    </button>
                  ) : (
                    <button style={{
                      marginTop: 16,
                      background: gradients.purpleRose,
                      color: '#fff',
                      border: 'none',
                      padding: '10px 24px',
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      width: '100%',
                    }}>
                      Add to My Plan
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showDonorIntake && (
        <DonorIntakeModal profile={profile} onClose={() => setShowDonorIntake(false)} />
      )}
    </div>
  );
}
