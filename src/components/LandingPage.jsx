import { Leaf, ArrowRight } from 'lucide-react';
import { colors, gradients, fonts } from '../theme';

const pills = ['Biomarkers', 'Your Score', 'Virtual Care', 'Treatment Paths'];

export default function LandingPage({ onGetStarted }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: gradients.dawn,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      fontFamily: fonts.family,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Soft radial accent in top-right for depth */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-10%',
        width: '55%',
        height: '55%',
        background: 'radial-gradient(circle, rgba(217, 136, 110, 0.35), transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Wordmark */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 48,
        position: 'relative',
        zIndex: 1,
      }}>
        <Leaf size={22} color="#E8E4DD" strokeWidth={1.5} style={{ transform: 'rotate(-15deg)' }} />
        <span style={{
          fontSize: 26,
          fontFamily: fonts.serif,
          fontWeight: 400,
          letterSpacing: -0.5,
          color: '#FBF9F5',
        }}>
          Eve
        </span>
      </div>

      <h1
        className="eve-hero-headline"
        style={{
          fontSize: 64,
          fontFamily: fonts.serif,
          fontWeight: 400,
          color: '#FBF9F5',
          textAlign: 'center',
          margin: '0 0 20px',
          lineHeight: 1.05,
          letterSpacing: -1.5,
          maxWidth: 720,
          position: 'relative',
          zIndex: 1,
        }}
      >
        Fertility, understood.
      </h1>

      <p
        className="eve-hero-subhead"
        style={{
          fontSize: 18,
          color: 'rgba(251, 249, 245, 0.75)',
          textAlign: 'center',
          maxWidth: 540,
          margin: '0 0 48px',
          lineHeight: 1.6,
          position: 'relative',
          zIndex: 1,
        }}
      >
        Track your biomarkers, compare your options, and build a plan — with the clarity to choose what's right for you.
      </p>

      <button
        onClick={onGetStarted}
        style={{
          background: '#FBF9F5',
          color: colors.plum,
          border: 'none',
          padding: '16px 32px',
          borderRadius: 999,
          fontSize: 16,
          fontWeight: 600,
          fontFamily: fonts.family,
          cursor: 'pointer',
          marginBottom: 56,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
          position: 'relative',
          zIndex: 1,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 10px 32px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.15)';
        }}
      >
        Get started
        <ArrowRight size={16} />
      </button>

      <div style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: 600,
        position: 'relative',
        zIndex: 1,
      }}>
        {pills.map(pill => (
          <span key={pill} style={{
            background: 'rgba(251, 249, 245, 0.08)',
            color: 'rgba(251, 249, 245, 0.85)',
            padding: '7px 16px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 500,
            border: '1px solid rgba(251, 249, 245, 0.15)',
            backdropFilter: 'blur(8px)',
          }}>
            {pill}
          </span>
        ))}
      </div>
    </div>
  );
}
