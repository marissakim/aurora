import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { questions } from '../data/questions';
import { colors, gradients, fonts } from '../theme';

export default function Onboarding({ onComplete }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;
  const isNewSection = current === 0 || questions[current - 1].section !== q.section;

  function handleSelect(option) {
    setSelected(option);
    const updated = { ...answers, [q.key]: option };
    setAnswers(updated);

    const delay = current === questions.length - 1 ? 300 : 200;
    setTimeout(() => {
      if (current < questions.length - 1) {
        setCurrent(current + 1);
        setSelected(null);
      } else {
        onComplete(updated);
      }
    }, delay);
  }

  function handleBack() {
    if (current > 0) {
      setCurrent(current - 1);
      setSelected(answers[questions[current - 1].key] || null);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
      fontFamily: fonts.family,
    }}>
      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 520, marginBottom: 40 }}>
        <div style={{ height: 6, background: colors.border, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: gradients.spice,
            borderRadius: 3,
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Back + counter row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          {current > 0 ? (
            <button onClick={handleBack} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
              color: colors.textLight, fontSize: 14, fontWeight: 500, padding: 0,
            }}>
              <ArrowLeft size={16} /> Back
            </button>
          ) : <div />}
          <span style={{ fontSize: 14, color: colors.textLight, fontWeight: 500 }}>
            {current + 1} of {questions.length}
          </span>
        </div>

        {/* Section label */}
        {isNewSection && (
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            background: '#F3E3D9',
            color: colors.rose,
            marginBottom: 16,
          }}>
            {q.section}
          </span>
        )}

        {/* Question */}
        <h2 style={{ fontSize: 28, fontWeight: 700, color: colors.text, margin: '0 0 28px', lineHeight: 1.3 }}>
          {q.question}
        </h2>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {q.options.map(option => {
            const isSelected = selected === option || answers[q.key] === option;
            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '16px 20px',
                  borderRadius: 12,
                  border: `2px solid ${isSelected ? colors.plum : colors.border}`,
                  background: isSelected ? '#F0EAEC' : '#fff',
                  cursor: 'pointer',
                  fontSize: 16,
                  fontWeight: 500,
                  color: colors.text,
                  transition: 'all 0.15s ease',
                  fontFamily: fonts.family,
                }}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
