import { ArrowRight } from 'lucide-react';
import { colors, gradients, fonts } from '../theme';
import EveLogo from './ui/EveLogo';

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

      {/* Brand mark — the visual anchor of the page */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        marginBottom: 24,
        position: 'relative',
        zIndex: 1,
      }}>
        <div className="eve-hero-leaf" style={{ color: '#E8E4DD', opacity: 0.85, lineHeight: 0 }}>
          <EveLogo size={72} strokeWidth={1.25} />
        </div>
        <h1
          className="eve-hero-brand"
          style={{
            fontSize: 168,
            fontFamily: fonts.serif,
            fontWeight: 400,
            letterSpacing: -4,
            color: '#FBF9F5',
            margin: 0,
            lineHeight: 1,
          }}
        >
          Eve
        </h1>
      </div>

      <p
        className="eve-hero-tagline"
        style={{
          fontSize: 28,
          fontFamily: fonts.serif,
          fontStyle: 'italic',
          fontWeight: 400,
          color: 'rgba(251, 249, 245, 0.9)',
          textAlign: 'center',
          margin: '0 0 32px',
          letterSpacing: -0.3,
          lineHeight: 1.35,
          position: 'relative',
          zIndex: 1,
        }}
      >
        The time is now.<br />
        The plan is yours.
      </p>

      <p
        className="eve-hero-subhead"
        style={{
          fontSize: 16,
          color: 'rgba(251, 249, 245, 0.65)',
          textAlign: 'center',
          maxWidth: 460,
          margin: '0 0 40px',
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
          marginBottom: 48,
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
