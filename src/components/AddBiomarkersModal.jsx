import { useState } from 'react';
import { X, Sparkles, Plus, Minus } from 'lucide-react';
import { colors, fonts } from '../theme';
import { biomarkerDefs } from '../data/biomarkers';

// Shared with BiomarkerIntake — derives status from a value vs. its normal range.
function deriveStatus(name, value) {
  const range = biomarkerDefs.find(d => d.name === name)?.range;
  if (!range || typeof value !== 'number') return 'good';
  const m = range.match(/([\d.]+)\s*[–-]\s*([\d.]+)/);
  if (!m) return 'good';
  const low = parseFloat(m[1]);
  const high = parseFloat(m[2]);
  if (value >= low && value <= high) return 'good';
  const overshoot = value < low ? (low - value) / low : (value - high) / high;
  return overshoot > 0.25 ? 'critical' : 'attention';
}

export default function AddBiomarkersModal({ existing = [], onClose, onSave }) {
  // Prefill from existing biomarkers if user is editing
  const [values, setValues] = useState(() =>
    Object.fromEntries(existing.map(b => [b.name, b.value]))
  );
  // Auto-expand extended fields if the user already has values for any of them
  const [showExtended, setShowExtended] = useState(() =>
    existing.some(b => biomarkerDefs.find(d => d.name === b.name)?.tier === 'extended')
  );

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
    // Preserve trends from existing entries; append new value as latest point
    const existingByName = Object.fromEntries(existing.map(b => [b.name, b]));
    const updated = biomarkerDefs
      .filter(def => values[def.name] !== undefined && values[def.name] !== '')
      .map(def => {
        const prev = existingByName[def.name];
        const newValue = values[def.name];
        // If the value actually changed, append to trend history
        const trend = prev && prev.value !== newValue
          ? [...prev.trend.slice(-4), newValue]
          : prev?.trend || [newValue];
        return {
          name: def.name,
          value: newValue,
          unit: def.unit,
          range: def.range,
          status: deriveStatus(def.name, newValue),
          trend,
        };
      });
    onSave(updated);
    onClose();
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(31, 24, 37, 0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, fontFamily: fonts.family,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 18,
          maxWidth: 560, width: '100%',
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative',
          padding: '28px 24px',
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

        <h2 style={{
          fontSize: 22, fontFamily: fonts.serif, fontWeight: 400,
          color: colors.text, margin: '0 0 4px',
          letterSpacing: -0.3,
        }}>
          Add your results
        </h2>
        <p style={{
          fontSize: 14, color: colors.textLight,
          margin: '0 0 20px', lineHeight: 1.5,
        }}>
          Enter whatever you have — it&apos;s completely fine to leave any field blank and update later.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
          {coreDefs.map(def => <Row key={def.name} def={def} values={values} setValue={setValue} />)}
        </div>

        {/* Progressive disclosure for extended clinic-workup markers */}
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
            marginBottom: showExtended ? 12 : 20,
            width: '100%',
            justifyContent: 'center',
          }}
        >
          {showExtended ? <Minus size={14} /> : <Plus size={14} />}
          {showExtended ? 'Hide extended fields' : 'Show 3 more fields (from a full clinic workup)'}
        </button>

        {showExtended && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
            {extendedDefs.map(def => <Row key={def.name} def={def} values={values} setValue={setValue} />)}
          </div>
        )}

        <button
          onClick={handleSave}
          style={{
            width: '100%',
            background: colors.spice,
            color: '#FBF9F5',
            border: 'none',
            padding: '14px 24px',
            borderRadius: 999,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: fonts.family,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            gap: 8,
            boxShadow: '0 4px 16px rgba(122, 66, 50, 0.25)',
          }}
        >
          <Sparkles size={16} />
          Save results
        </button>
      </div>
    </div>
  );
}

function Row({ def, values, setValue }) {
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
