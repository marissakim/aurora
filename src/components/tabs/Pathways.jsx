import { useState, useEffect } from 'react';
import { Sparkles, UserPlus, Home, Stethoscope, Video, Snowflake, ArrowRight } from 'lucide-react';
import { colors, cardStyle, gradients, fonts } from '../../theme';
import { pathways as pathwayData } from '../../data/pathways';
import { computePathwayFit } from '../../utils/scoring';
import { generateAnalysis } from '../../utils/aiInsights';
import { sampleBiomarkers } from '../../data/biomarkers';
import DonorIntakeModal from '../DonorIntakeModal';

export default function Pathways({ profile, onPathwaySelected, onNavigate }) {
  const [expanded, setExpanded] = useState(null);
  const [showDonorIntake, setShowDonorIntake] = useState(false);
  const [reasoning, setReasoning] = useState({});

  const is40Plus = ['38–40', '41+'].includes(profile?.age);

  const scored = pathwayData.map(p => ({
    ...p,
    fit: computePathwayFit(profile, p.id),
  })).sort((a, b) => b.fit - a.fit);

  useEffect(() => {
    generateAnalysis(profile, sampleBiomarkers).then(r => setReasoning(r.pathwayReasoning || {}));
  }, [profile]);

  // 40+ users get a simplified, action-oriented Pathways view — the
  // realistic decision space narrows to a handful of concrete next moves.
  if (is40Plus) {
    return <ActionCardsView profile={profile} onNavigate={onNavigate} />;
  }

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
                  background: colors.spice, color: '#fff',
                  fontSize: 11, fontWeight: 700, padding: '3px 10px',
                  borderRadius: 8, textTransform: 'uppercase', letterSpacing: 0.5,
                  boxShadow: '0 2px 8px rgba(122, 66, 50, 0.25)',
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

                  {reasoning[p.id] && (
                    <div style={{
                      background: 'linear-gradient(135deg, #FBF9F5 0%, #F7EBE6 100%)',
                      border: `1px solid ${colors.border}`,
                      borderRadius: 10,
                      padding: 14,
                      marginBottom: 20,
                      display: 'flex',
                      gap: 10,
                      alignItems: 'flex-start',
                    }}>
                      <Sparkles size={16} color={colors.plum} style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: colors.plum, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px' }}>
                          Eve Reasoning
                        </p>
                        <p style={{ fontSize: 13, color: colors.text, margin: 0, lineHeight: 1.5 }}>
                          {reasoning[p.id]}
                        </p>
                      </div>
                    </div>
                  )}

                  <h4 style={{ fontSize: 14, fontWeight: 700, color: colors.plum, margin: '0 0 12px' }}>Your Personalized Steps</h4>
                  <ol style={{ margin: 0, paddingLeft: 20 }}>
                    {p.steps.map((step, j) => (
                      <li key={j} style={{ fontSize: 14, color: colors.text, marginBottom: 8, lineHeight: 1.5 }}>{step}</li>
                    ))}
                  </ol>

                  {/* Action button only for pathways with a real next step (donor program intake).
                      Non-donor pathways: the personalized steps above already serve as the "what to do"
                      and the My Plan tab carries those forward. No dead 'Add to My Plan' button. */}
                  {p.isDonorProgram && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowDonorIntake(true); }}
                      style={{
                        marginTop: 16,
                        background: colors.spice,
                        color: '#FBF9F5',
                        border: 'none',
                        padding: '14px 24px',
                        borderRadius: 999,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                        width: '100%',
                        fontFamily: 'inherit',
                        boxShadow: '0 4px 16px rgba(122, 66, 50, 0.3)',
                      }}
                    >
                      💝 Start Eligibility Intake (2 min)
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showDonorIntake && (
        <DonorIntakeModal
          profile={profile}
          onClose={() => setShowDonorIntake(false)}
          onSubmitted={() => onPathwaySelected?.('splitFreeze')}
        />
      )}
    </div>
  );
}

// Simplified 5-card action view for 40+ users. Replaces the full
// 7-pathway comparison with action-oriented next steps — the realistic
// decision space at this age.
function ActionCardsView({ profile, onNavigate }) {
  const isCommittedToDonor = profile?.goal === 'Donor/surrogacy';

  // Ordering: when a user has already committed to donor/surrogacy, Find
  // a Donor goes first. Otherwise, the donor option still leads — at 40+
  // it's the highest-odds path for most users.
  const actions = [
    {
      key: 'donor',
      icon: <UserPlus size={22} color={colors.spice} />,
      title: 'Find a Donor',
      subtitle: 'Egg donor programs and banks',
      body: 'At your age, donor cycles often deliver 50–65% live birth rates per transfer — the highest-odds path for most users.',
      cta: 'View donor options',
      onClick: () => onNavigate?.('clinics', { filter: 'Egg Donors' }),
      primary: true,
    },
    {
      key: 'surrogacy',
      icon: <Home size={22} color={colors.spice} />,
      title: 'Learn About Surrogacy',
      subtitle: 'Gestational carrier agencies',
      body: 'If carrying isn\'t right for you, surrogacy agencies guide the matching, legal, and medical process over 12–18 months.',
      cta: 'View agencies',
      onClick: () => onNavigate?.('clinics', { filter: 'Surrogacy Agencies' }),
    },
    {
      key: 'doctor',
      icon: <Stethoscope size={22} color={colors.spice} />,
      title: 'Find a Doctor',
      subtitle: 'Reproductive endocrinologists near you',
      body: 'Start with a consultation to weigh all your options — own-egg IVF, donor eggs, and beyond. An RE can be your guide.',
      cta: 'View clinics',
      onClick: () => onNavigate?.('clinics', { filter: 'IVF Clinics' }),
    },
    {
      key: 'virtual',
      icon: <Video size={22} color={colors.spice} />,
      title: 'Schedule a Virtual Consult',
      subtitle: 'A lighter first step',
      body: 'Virtual consults ($25–$250) help you understand options without a full clinic intake. Often the fastest way to get moving.',
      cta: 'View virtual care',
      onClick: () => onNavigate?.('clinics', { filter: 'Virtual Care' }),
    },
    {
      key: 'freeze',
      icon: <Snowflake size={22} color={colors.spice} />,
      title: 'Freeze Eggs',
      subtitle: 'Banking what you have',
      body: 'At your age, cycles typically yield fewer eggs per retrieval — but some choose to bank what they can before moving to other paths.',
      cta: 'View clinics that freeze',
      onClick: () => onNavigate?.('clinics', { filter: 'IVF Clinics' }),
    },
  ];

  // If user committed to donor path, already highlight the Find a Donor card
  // in the order (it's already first, so this is just aesthetic confirmation).
  if (isCommittedToDonor) actions[0].primary = true;

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: colors.text, margin: '0 0 8px' }}>Your Pathways</h2>
      <p style={{ fontSize: 14, color: colors.textLight, margin: '0 0 20px', lineHeight: 1.5 }}>
        At your age, these are the options most worth considering. Each card takes you
        straight to the directory or providers you need to act on it.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 14,
      }}>
        {actions.map(action => (
          <div
            key={action.key}
            onClick={action.onClick}
            style={{
              ...cardStyle,
              cursor: 'pointer',
              position: 'relative',
              border: action.primary ? `2px solid ${colors.spice}` : cardStyle.border,
              background: action.primary ? 'linear-gradient(135deg, #FFFFFF 0%, #F7EBE6 100%)' : '#fff',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.06)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {action.primary && (
              <span style={{
                position: 'absolute', top: -10, right: 16,
                background: colors.spice, color: '#fff',
                fontSize: 10, fontWeight: 700, padding: '3px 10px',
                borderRadius: 8, textTransform: 'uppercase', letterSpacing: 0.5,
                boxShadow: '0 2px 8px rgba(122, 66, 50, 0.3)',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <Sparkles size={10} /> Top recommendation
              </span>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: colors.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {action.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.text, margin: 0 }}>
                  {action.title}
                </h3>
                <p style={{ fontSize: 12, fontWeight: 600, color: colors.textLight, margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                  {action.subtitle}
                </p>
              </div>
            </div>

            <p style={{ fontSize: 13, color: colors.textLight, margin: '0 0 14px', lineHeight: 1.55 }}>
              {action.body}
            </p>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              color: colors.spice, fontSize: 13, fontWeight: 600,
              fontFamily: fonts.family,
            }}>
              {action.cta} <ArrowRight size={14} />
            </div>
          </div>
        ))}
      </div>

      <p style={{
        fontSize: 12, color: colors.textLight, marginTop: 20,
        fontStyle: 'italic', textAlign: 'center', lineHeight: 1.5,
      }}>
        These are the paths worth weighing at your age — an RE can help you think through which combination is right for you.
      </p>
    </div>
  );
}
