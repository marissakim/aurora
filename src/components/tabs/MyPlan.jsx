import { useState } from 'react';
import { colors, cardStyle, gradients } from '../../theme';
import { planPhases } from '../../data/plan';

const categoryColors = {
  Health: { bg: '#E8F5E9', color: '#2E7D32' },
  Appointment: { bg: '#F3E8FF', color: '#5B3E8A' },
  Financial: { bg: '#FFF8E1', color: '#E8A840' },
};

export default function MyPlan() {
  const [completed, setCompleted] = useState(new Set());

  function toggleTask(id) {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: colors.text, margin: '0 0 8px' }}>My Plan</h2>
      <p style={{ fontSize: 14, color: colors.textLight, margin: '0 0 24px' }}>
        Your personalized action plan based on your profile and goals.
      </p>

      {planPhases.map((phase, pi) => (
        <div key={phase.title} style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
          {/* Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: gradients.purpleRose,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 16, fontWeight: 700,
            }}>
              {pi + 1}
            </div>
            {pi < planPhases.length - 1 && (
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
