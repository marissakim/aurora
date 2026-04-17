import { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { colors, gradients, fonts } from '../theme';

const questions = [
  {
    key: 'age',
    label: 'What is your age?',
    help: 'Most donor programs accept applicants aged 21–32.',
    options: ['Under 21', '21–25', '26–28', '29–32', '33–34', '35+'],
  },
  {
    key: 'health',
    label: 'How would you describe your overall health?',
    help: 'Donor programs require good general health and no major genetic conditions.',
    options: [
      'Excellent — no chronic conditions',
      'Good — minor issues managed',
      'Fair — one or more chronic conditions',
      'Prefer not to say',
    ],
  },
  {
    key: 'education',
    label: 'What is the highest level of education you have completed?',
    help: 'This is commonly requested by intended parents during matching.',
    options: [
      'High school',
      'Some college',
      "Associate's / Trade school",
      "Bachelor's degree",
      "Master's degree",
      'Doctorate / Professional degree',
    ],
  },
];

function isEligible(answers) {
  const goodAge = ['21–25', '26–28', '29–32'].includes(answers.age);
  const notBadHealth = answers.health !== 'Fair — one or more chronic conditions';
  return goodAge && notBadHealth;
}

export default function DonorIntakeModal({ profile, onClose, onSubmitted }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    // Pre-fill age from profile if possible
    age: profile.age === 'Under 30' ? '26–28' : profile.age === '30–34' ? '29–32' : '',
  });
  const [submitted, setSubmitted] = useState(false);

  const q = questions[step];
  const isLast = step === questions.length - 1;

  function handleSelect(option) {
    const updated = { ...answers, [q.key]: option };
    setAnswers(updated);
    setTimeout(() => {
      if (isLast) {
        setSubmitted(true);
        // Personalize the My Plan tab — user has expressed commitment
        // by submitting their info to Cofertility
        onSubmitted?.();
      } else {
        setStep(step + 1);
      }
    }, 200);
  }

  const eligible = submitted && isEligible(answers);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(31, 24, 37, 0.55)', backdropFilter: 'blur(4px)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, fontFamily: fonts.family,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 18, maxWidth: 520, width: '100%',
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 16, right: 16,
            background: colors.bg, border: 'none', borderRadius: 8,
            width: 32, height: 32, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={18} color={colors.textLight} />
        </button>

        {!submitted ? (
          <div style={{ padding: '32px 28px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>💝</span>
              <span style={{
                fontSize: 11, fontWeight: 700, color: colors.rose,
                textTransform: 'uppercase', letterSpacing: 0.8,
              }}>
                Donor-Funded Egg Freezing
              </span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: colors.text, margin: '0 0 6px' }}>
              Eligibility Intake
            </h2>
            <p style={{ fontSize: 14, color: colors.textLight, margin: '0 0 24px', lineHeight: 1.5 }}>
              Answer 3 quick questions to see if you qualify. Takes under a minute.
            </p>

            {/* Progress bar */}
            <div style={{ height: 4, background: colors.border, borderRadius: 2, marginBottom: 24 }}>
              <div style={{
                height: '100%', width: `${((step + 1) / questions.length) * 100}%`,
                background: gradients.purpleRose, borderRadius: 2, transition: 'width 0.3s',
              }} />
            </div>

            {/* Question */}
            <p style={{ fontSize: 12, fontWeight: 600, color: colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 8px' }}>
              Question {step + 1} of {questions.length}
            </p>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.text, margin: '0 0 6px', lineHeight: 1.3 }}>
              {q.label}
            </h3>
            <p style={{ fontSize: 13, color: colors.textLight, margin: '0 0 20px', lineHeight: 1.5 }}>
              {q.help}
            </p>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {q.options.map(option => {
                const isSelected = answers[q.key] === option;
                return (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '14px 18px',
                      borderRadius: 10,
                      border: `2px solid ${isSelected ? colors.plum : colors.border}`,
                      background: isSelected ? '#F0EAEC' : '#fff',
                      cursor: 'pointer', fontSize: 15, fontWeight: 500,
                      color: colors.text, fontFamily: fonts.family,
                      transition: 'all 0.15s',
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                style={{
                  marginTop: 16, background: 'none', border: 'none',
                  color: colors.textLight, fontSize: 14, fontWeight: 500,
                  cursor: 'pointer', padding: 0,
                }}
              >
                ← Back
              </button>
            )}
          </div>
        ) : (
          <div style={{ padding: '40px 28px', textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: eligible ? '#E8F5E9' : '#FFF3E0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <CheckCircle2 size={36} color={eligible ? colors.sage : '#E0901A'} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: colors.text, margin: '0 0 12px' }}>
              {eligible ? 'Thanks — you may qualify!' : 'Thanks for your interest'}
            </h2>
            <p style={{ fontSize: 15, color: colors.textLight, margin: '0 0 20px', lineHeight: 1.6 }}>
              {eligible ? (
                <>
                  Your intake has been securely submitted to <strong style={{ color: colors.text }}>Cofertility</strong>, our partner donor agency. They&apos;ll reach out within 2–3 business days with next steps, including medical screening and matching.
                </>
              ) : (
                <>
                  Your intake has been submitted. Based on your answers, you may not meet the typical eligibility criteria for the donor-funded program — but the partner agency will review and reach out if any programs are a match.
                </>
              )}
            </p>

            <div style={{
              background: colors.bg, borderRadius: 10, padding: 16,
              textAlign: 'left', marginBottom: 20,
            }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 10px' }}>
                Your Submission
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {questions.map(q => (
                  <div key={q.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 13 }}>
                    <span style={{ color: colors.textLight, flexShrink: 0 }}>{q.key.charAt(0).toUpperCase() + q.key.slice(1)}</span>
                    <span style={{ color: colors.text, fontWeight: 500, textAlign: 'right' }}>{answers[q.key]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: '#F0EAEC',
              borderRadius: 10,
              padding: 12,
              marginBottom: 16,
              fontSize: 13,
              color: colors.plum,
              fontWeight: 500,
              lineHeight: 1.4,
            }}>
              ✨ Your <strong>My Plan</strong> has been updated with the next steps for the Cofertility program.
            </div>

            <p style={{ fontSize: 12, color: colors.textLight, lineHeight: 1.5, margin: '0 0 20px' }}>
              Eve shares your intake with partner agencies in compliance with ASRM and FDA donor guidelines. You can withdraw consent at any time.
            </p>

            <button
              onClick={onClose}
              style={{
                width: '100%', background: gradients.purpleRose, color: '#fff',
                border: 'none', padding: '12px 24px', borderRadius: 10,
                fontSize: 15, fontWeight: 600, cursor: 'pointer',
                fontFamily: fonts.family,
              }}
            >
              Got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
