import { useState } from 'react';
import { ArrowRight, ArrowLeft, FlaskConical, Heart, Sparkles, Plus, Minus } from 'lucide-react';
import { colors, gradients, fonts } from '../theme';
import { biomarkerDefs } from '../data/biomarkers';

// Three paths from this intake:
//   'enter'  → form to add biomarker values
//   'tested' → educational screen with virtual care CTA
//   'skip'   → straight to dashboard with empty biomarkers
export default function BiomarkerIntake({ profile, onComplete, onGetTested }) {
  const [step, setStep] = useState('choose'); // choose | enter | tested
  const [values, setValues] = useState({});
  const [showExtended, setShowExtended] = useState(false);

  const coreDefs = biomarkerDefs.filter(d => d.tier === 'core');
  const extendedDefs = biomarkerDefs.filter(d => d.tier === 'extended');

  function setValue(name, raw) {
    if (raw === '') {
      const next = { ...values };
      delete next[name];
      setValues(next);
    } else {
      const num = parseFloat(raw);
      setValues({ ...values, [name]: isNaN(num) ? raw : num });
    }
  }

  function handleSave() {
    // Convert entered values into biomarker objects
    const biomarkers = biomarkerDefs
      .filter(def => values[def.name] !== undefined && values[def.name] !== '')
      .map(def => ({
        name: def.name,
        value: values[def.name],
        unit: def.unit,
        range: def.range,
        status: deriveStatus(def.name, values[def.name]),
        // Single data point until they add more — sparkline will just show one dot
        trend: [values[def.name]],
      }));
    onComplete(biomarkers);
  }

  // CHOOSE STEP: warm three-way prompt
  if (step === 'choose') {
    return (
      <Shell>
        <Eyebrow>Step 2 of 2 · Optional</Eyebrow>
        <Headline>Want to add your test results?</Headline>
        <Subhead>
          Adding your biomarkers lets Eve give you more personalized insights and a sharper plan.
          Don&apos;t have results yet? That&apos;s totally normal — we can help you find testing too.
        </Subhead>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 480 }}>
          <ChoiceCard
            icon={<FlaskConical size={20} color={colors.plum} />}
            title="Yes — I have results to add"
            sub="Enter what you have. You can skip any field."
            onClick={() => setStep('enter')}
            primary
          />
          <ChoiceCard
            icon={<Heart size={20} color={colors.teal} />}
            title="Not yet — I haven't been tested"
            sub="We'll point you toward affordable virtual testing."
            onClick={() => setStep('tested')}
          />
          <button
            onClick={() => onComplete([])}
            style={{
              background: 'none', border: 'none', color: colors.textLight,
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
              padding: '14px', marginTop: 4, fontFamily: fonts.family,
            }}
          >
            Skip for now — I&apos;ll add this later
          </button>
        </div>
      </Shell>
    );
  }

  // TESTED STEP: warm explainer + CTAs
  if (step === 'tested') {
    return (
      <Shell>
        <BackLink onClick={() => setStep('choose')} />
        <Eyebrow>You&apos;re in good company</Eyebrow>
        <Headline>Most people start exactly here.</Headline>
        <Subhead>
          Getting baseline labs is a great first step — and it doesn&apos;t require a fertility clinic.
          Several telehealth providers offer at-home hormone panels for $179 or less, with results in 5–10 days.
        </Subhead>

        <div style={{
          background: 'linear-gradient(135deg, #FBF9F5 0%, #F7EBE6 100%)',
          borderRadius: 14,
          padding: 20,
          maxWidth: 480,
          width: '100%',
          marginBottom: 24,
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: colors.plum, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 8px' }}>
            What to ask for
          </p>
          <p style={{ fontSize: 14, color: colors.text, margin: '0 0 12px', lineHeight: 1.6 }}>
            A standard fertility panel measures <strong>AMH, FSH, AFC, TSH, and Vitamin D</strong>.
            Most providers also include estradiol, prolactin, and thyroid antibodies.
          </p>
          <p style={{ fontSize: 13, color: colors.textLight, margin: 0, lineHeight: 1.5 }}>
            Eve can help you understand the results once you have them.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 480 }}>
          <button
            onClick={() => onGetTested?.()}
            style={primaryBtn}
          >
            Browse virtual testing options <ArrowRight size={16} />
          </button>
          <button
            onClick={() => onComplete([])}
            style={ghostBtn}
          >
            Continue to dashboard
          </button>
        </div>
      </Shell>
    );
  }

  // ENTER STEP: form
  return (
    <Shell>
      <BackLink onClick={() => setStep('choose')} />
      <Eyebrow>Add your results</Eyebrow>
      <Headline>What numbers do you have?</Headline>
      <Subhead>
        Add whatever you have — you can leave any field blank and update later.
        Hover for normal ranges.
      </Subhead>

      <div style={{
        background: '#fff',
        border: `1px solid ${colors.border}`,
        borderRadius: 14,
        padding: 20,
        maxWidth: 520,
        width: '100%',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {coreDefs.map(def => (
            <FormRow key={def.name} def={def} values={values} setValue={setValue} />
          ))}
        </div>

        <button
          onClick={() => setShowExtended(s => !s)}
          style={{
            background: 'none',
            border: `1px dashed ${colors.border}`,
            borderRadius: 10,
            padding: '10px 14px',
            color: colors.textLight,
            fontSize: 13,
            fontWeight: 500,
            fontFamily: fonts.family,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 14,
            marginBottom: showExtended ? 14 : 0,
            width: '100%',
            justifyContent: 'center',
          }}
        >
          {showExtended ? <Minus size={14} /> : <Plus size={14} />}
          {showExtended ? 'Hide extended fields' : 'Show 3 more fields (from a full clinic workup)'}
        </button>

        {showExtended && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {extendedDefs.map(def => (
              <FormRow key={def.name} def={def} values={values} setValue={setValue} />
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 520 }}>
        <button onClick={handleSave} style={primaryBtn}>
          <Sparkles size={16} />
          Save and see my insights
        </button>
        <button onClick={() => onComplete([])} style={ghostBtn}>
          Skip for now
        </button>
      </div>
    </Shell>
  );
}

// ─── Form row used for both core and extended biomarker inputs ──────
function FormRow({ def, values, setValue }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: colors.text, margin: '0 0 2px' }}>
          {def.name}
        </p>
        <p style={{ fontSize: 11, color: colors.textLight, margin: 0 }}>
          {def.description} · Normal: {def.range} {def.unit}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          type="text"
          inputMode="decimal"
          placeholder="—"
          value={values[def.name] ?? ''}
          onChange={e => setValue(def.name, e.target.value)}
          style={{
            width: 90,
            padding: '8px 12px',
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
            fontSize: 15,
            fontFamily: fonts.family,
            color: colors.text,
            textAlign: 'right',
            outline: 'none',
          }}
          onFocus={e => e.target.style.border = `1px solid ${colors.plum}`}
          onBlur={e => e.target.style.border = `1px solid ${colors.border}`}
        />
        <span style={{ fontSize: 12, color: colors.textLight, minWidth: 60 }}>
          {def.unit}
        </span>
      </div>
    </div>
  );
}

// ─── Tone-driven status mapping ──────────────────────────────────────
// Compares value to normal range, returns 'good' | 'attention' | 'critical'.
// Range strings come from biomarkerDefs (e.g. "1.0–3.5").
function deriveStatus(name, value) {
  const range = biomarkerDefs.find(d => d.name === name)?.range;
  if (!range || typeof value !== 'number') return 'good';
  const m = range.match(/([\d.]+)\s*[–-]\s*([\d.]+)/);
  if (!m) return 'good';
  const low = parseFloat(m[1]);
  const high = parseFloat(m[2]);
  if (value >= low && value <= high) return 'good';
  // How far outside? (relative)
  const overshoot = value < low ? (low - value) / low : (value - high) / high;
  return overshoot > 0.25 ? 'critical' : 'attention';
}

// ─── Shared layout primitives ──────────────────────────────────────
function Shell({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 24px',
      fontFamily: fonts.family,
    }}>
      <div style={{ width: '100%', maxWidth: 540, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {children}
      </div>
    </div>
  );
}

function Eyebrow({ children }) {
  return (
    <p style={{
      fontSize: 12, fontWeight: 600, color: colors.rose,
      textTransform: 'uppercase', letterSpacing: 0.8,
      margin: '0 0 12px',
    }}>
      {children}
    </p>
  );
}

function Headline({ children }) {
  return (
    <h2 style={{
      fontSize: 32,
      fontFamily: fonts.serif,
      fontWeight: 400,
      color: colors.text,
      textAlign: 'center',
      margin: '0 0 12px',
      lineHeight: 1.2,
      letterSpacing: -0.5,
    }}>
      {children}
    </h2>
  );
}

function Subhead({ children }) {
  return (
    <p style={{
      fontSize: 15, color: colors.textLight,
      textAlign: 'center', maxWidth: 480,
      margin: '0 0 28px', lineHeight: 1.6,
    }}>
      {children}
    </p>
  );
}

function ChoiceCard({ icon, title, sub, onClick, primary }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: '#fff',
        border: `${primary ? 2 : 1}px solid ${primary ? colors.plum : colors.border}`,
        borderRadius: 12,
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: fonts.family,
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: colors.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: colors.text, margin: '0 0 2px' }}>{title}</p>
        <p style={{ fontSize: 13, color: colors.textLight, margin: 0 }}>{sub}</p>
      </div>
      <ArrowRight size={18} color={colors.textLight} />
    </button>
  );
}

function BackLink({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 4,
        color: colors.textLight, fontSize: 14, fontWeight: 500,
        padding: 0, marginBottom: 16, alignSelf: 'flex-start',
        fontFamily: fonts.family,
      }}
    >
      <ArrowLeft size={16} /> Back
    </button>
  );
}

const primaryBtn = {
  background: colors.spice,
  color: '#FBF9F5',
  border: 'none',
  padding: '14px 20px',
  borderRadius: 999,
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  fontFamily: fonts.family,
  boxShadow: '0 4px 16px rgba(122, 66, 50, 0.25)',
};

const ghostBtn = {
  background: 'none',
  color: colors.textLight,
  border: `1px solid ${colors.border}`,
  padding: '12px 20px',
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: fonts.family,
};
