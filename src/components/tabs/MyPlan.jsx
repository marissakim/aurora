import { ExternalLink, Sparkles } from 'lucide-react';
import { colors, cardStyle, gradients } from '../../theme';
import { getPlanForPathway } from '../../data/plan';
import { composePlan } from '../../utils/planComposer';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const categoryColors = {
  Health: { bg: '#E8F5E9', color: '#2E7D32' },
  Appointment: { bg: '#F0EAEC', color: '#3D2E3D' },
  Financial: { bg: '#FFF8E1', color: '#B8924A' },
  Legal: { bg: '#FFEBEE', color: '#C2185B' },
};

const pathwayBadges = {
  splitFreeze: {
    icon: '\uD83D\uDC9D',
    label: 'Donor-Funded Egg Freezing',
    partner: 'Cofertility',
    partnerUrl: 'https://cofertility.com',
  },
};

export default function MyPlan({ profile = {}, selectedPathway, onNavigate }) {
  // Store completed task IDs as an array in localStorage (Set isn't serializable).
  // Convert to a Set at use-site for fast lookups and immutable updates.
  const [completedIds, setCompletedIds] = useLocalStorage('eve:completedTasks', []);
  const completed = new Set(completedIds);

  // When user has committed to a specific pathway (e.g. donor-funded), use
  // that hand-authored plan. Otherwise compose from their onboarding profile.
  const plan = selectedPathway
    ? getPlanForPathway(selectedPathway)
    : composePlan(profile);
  const badge = selectedPathway ? pathwayBadges[selectedPathway] : null;
  const isComposed = !selectedPathway;

  function toggleTask(id) {
    setCompletedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return Array.from(next);
    });
  }

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: colors.text, margin: '0 0 8px' }}>My Plan</h2>
      <p style={{ fontSize: 14, color: colors.textLight, margin: '0 0 20px' }}>
        Your personalized action plan based on your profile and goals.
      </p>

      {/* AI-personalized hint shown when plan is composed from onboarding profile */}
      {isComposed && !badge && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'linear-gradient(135deg, #FBF9F5 0%, #F7EBE6 100%)',
          border: `1px solid ${colors.border}`,
          borderRadius: 10,
          padding: '12px 14px',
          marginBottom: 20,
        }}>
          <Sparkles size={16} color={colors.spice} />
          <p style={{ fontSize: 13, color: colors.text, margin: 0, lineHeight: 1.5 }}>
            This plan is composed from your onboarding answers. It&apos;ll adapt as you add biomarkers and mark off steps.
          </p>
        </div>
      )}

      {/* Pathway badge shown when user has committed to a specific pathway */}
      {badge && (
        <div style={{
          background: gradients.spiceDeep,
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: 'rgba(255,255,255,0.25)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            fontSize: 22,
          }}>
            {badge.icon}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{
              fontSize: 10, fontWeight: 700, color: '#fff',
              textTransform: 'uppercase', letterSpacing: 0.5,
              margin: '0 0 2px', opacity: 0.9,
            }}>
              Personalized for
            </p>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>
              {badge.label}
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
              Next steps are tailored for the {badge.partner} program.
            </p>
          </div>
          <a
            href={badge.partnerUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              whiteSpace: 'nowrap',
            }}
          >
            {badge.partner} <ExternalLink size={12} />
          </a>
        </div>
      )}

      {plan.map((phase, pi) => (
        <div key={phase.title} style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
          {/* Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: gradients.spice,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 16, fontWeight: 700,
              boxShadow: '0 2px 8px rgba(122, 66, 50, 0.2)',
            }}>
              {pi + 1}
            </div>
            {pi < plan.length - 1 && (
              <div style={{ width: 2, flex: 1, background: colors.border, marginTop: 8 }} />
            )}
          </div>

          {/* Phase content */}
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.plum, margin: '6px 0 12px' }}>
              {phase.title}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {phase.tasks.map(task => {
                const isDone = completed.has(task.id);
                const cat = categoryColors[task.category] || categoryColors.Health;
                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    style={{
                      ...cardStyle,
                      padding: '14px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      opacity: isDone ? 0.5 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: 6,
                      border: `2px solid ${isDone ? colors.sage : colors.border}`,
                      background: isDone ? colors.sage : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.2s',
                    }}>
                      {isDone && (
                        <svg width="12" height="12" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span style={{
                      fontSize: 14, color: colors.text, flex: 1,
                      textDecoration: isDone ? 'line-through' : 'none',
                    }}>
                      {task.text}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      padding: '2px 8px', borderRadius: 6,
                      background: cat.bg, color: cat.color,
                      whiteSpace: 'nowrap',
                    }}>
                      {task.category}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      <p style={{ fontSize: 13, color: colors.textLight, textAlign: 'center', marginTop: 8 }}>
        Your plan updates automatically as you log new data and check off steps.
      </p>
    </div>
  );
}
