import { Sun } from 'lucide-react';
import { colors, gradients } from '../theme';

const pills = ['Track Biomarkers', 'Personalized Score', 'Find Clinics', 'Compare Costs'];

export default function LandingPage({ onGetStarted }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: gradients.dawn,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: 20,
        padding: '20px 32px',
        marginBottom: 32,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <Sun size={32} color="#E8A840" />
        <span style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: 1.5, textTransform: 'uppercase' }}>
          AURORA
        </span>
      </div>

      <h1 className="aurora-hero-headline" style={{ fontSize: 44, fontWeight: 800, color: '#fff', textAlign: 'center', margin: '0 0 16px', lineHeight: 1.2 }}>
        Your fertility, illuminated.
      </h1>

      <p className="aurora-hero-subhead" style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', textAlign: 'center', maxWidth: 520, margin: '0 0 40px', lineHeight: 1.6 }}>
        Track your biomarkers, get a personalized fertility score, compare treatment pathways, and build your plan — all in one place.
      </p>

      <button
        onClick={onGetStarted}
        style={{
          background: '#fff',
          color: colors.plum,
          border: 'none',
          padding: '16px 48px',
          borderRadius: 14,
          fontSize: 18,
          fontWeight: 700,
          cursor: 'pointer',
          marginBottom: 40,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
      >
        Get Started
      </button>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {pills.map(pill => (
          <span key={pill} style={{
            background: 'rgba(255,255,255,0.15)',
            color: '#fff',
            padding: '8px 20px',
            borderRadius: 20,
            fontSize: 14,
            fontWeight: 500,
            backdropFilter: 'blur(10px)',
          }}>
            {pill}
          </span>
        ))}
      </div>
    </div>
  );
}
