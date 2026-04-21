import { useState } from 'react';
import { X, ArrowRight, Check, Truck, Sparkles } from 'lucide-react';
import { colors, fonts, gradients } from '../theme';
import { eveKits, recommendKit } from '../data/kits';
import EveLogo from './ui/EveLogo';

// Three-kit chooser modal. Recommends the kit best matched to the user's
// profile, but all three are orderable. Mock order flow shows a
// confirmation screen instead of submitting anywhere.
export default function EveKitModal({ profile = {}, onClose, onOrdered }) {
  const recommended = recommendKit(profile);
  const [ordered, setOrdered] = useState(null); // kit object once user "orders"

  function handleOrder(kit) {
    setOrdered(kit);
    onOrdered?.(kit);
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
          maxWidth: 640, width: '100%',
          maxHeight: '92vh', overflowY: 'auto',
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
            zIndex: 1,
          }}
        >
          <X size={18} color={colors.textLight} />
        </button>

        {ordered ? (
          <ConfirmationView kit={ordered} onClose={onClose} />
        ) : (
          <ChooserView profile={profile} recommended={recommended} onOrder={handleOrder} />
        )}
      </div>
    </div>
  );
}

function ChooserView({ profile, recommended, onOrder }) {
  return (
    <div style={{ padding: '32px 28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ color: colors.spice, lineHeight: 0 }}>
          <EveLogo size={24} strokeWidth={1.75} />
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, color: colors.spice,
          textTransform: 'uppercase', letterSpacing: 0.8,
        }}>
          Eve Kits
        </span>
      </div>
      <h2 style={{
        fontSize: 26, fontFamily: fonts.serif, fontWeight: 400,
        color: colors.text, margin: '0 0 8px',
        letterSpacing: -0.5,
      }}>
        Choose your at-home panel
      </h2>
      <p style={{ fontSize: 14, color: colors.textLight, margin: '0 0 20px', lineHeight: 1.6 }}>
        A single finger-prick at home, results in 5–7 days, delivered to your dashboard.
        Pick the kit that fits where you are right now — you can always order another.
      </p>

      {/* Kit cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {eveKits.map(kit => (
          <KitCard
            key={kit.id}
            kit={kit}
            isRecommended={kit.id === recommended}
            profile={profile}
            onOrder={() => onOrder(kit)}
          />
        ))}
      </div>

      {/* Footer trust signals */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap',
        marginTop: 20, paddingTop: 16, borderTop: `1px solid ${colors.border}`,
        fontSize: 12, color: colors.textLight,
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Truck size={12} /> Free shipping
        </span>
        <span>CLIA-certified lab</span>
        <span>HSA / FSA eligible</span>
      </div>
    </div>
  );
}

function KitCard({ kit, isRecommended, profile, onOrder }) {
  const [showAll, setShowAll] = useState(false);
  const visibleMarkers = showAll ? kit.markers : kit.markers.slice(0, 5);
  const hiddenCount = kit.markers.length - visibleMarkers.length;

  return (
    <div style={{
      border: `${isRecommended ? 2 : 1}px solid ${isRecommended ? colors.spice : colors.border}`,
      borderRadius: 14,
      padding: 18,
      position: 'relative',
      background: isRecommended ? 'linear-gradient(135deg, #FFFFFF 0%, #F7EBE6 100%)' : '#fff',
    }}>
      {isRecommended && (
        <span style={{
          position: 'absolute', top: -10, right: 16,
          background: colors.spice, color: '#fff',
          fontSize: 10, fontWeight: 700, padding: '3px 10px',
          borderRadius: 8, textTransform: 'uppercase', letterSpacing: 0.5,
          boxShadow: '0 2px 8px rgba(122, 66, 50, 0.3)',
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          <Sparkles size={10} /> Recommended for you
        </span>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: 17, fontWeight: 700, color: colors.text, margin: '0 0 2px',
          }}>
            {kit.name}
          </h3>
          <p style={{ fontSize: 13, color: colors.spice, fontWeight: 600, margin: 0 }}>
            {kit.tagline}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: colors.text, margin: 0, fontFamily: fonts.serif }}>
            ${kit.price}
          </p>
        </div>
      </div>

      <p style={{ fontSize: 13, color: colors.textLight, margin: '8px 0 12px', lineHeight: 1.5 }}>
        {kit.description}
      </p>

      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 6px' }}>
          What it measures
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {visibleMarkers.map(m => (
            <span key={m} style={{
              fontSize: 11, fontWeight: 600,
              padding: '3px 9px', borderRadius: 6,
              background: colors.bg, color: colors.text,
            }}>
              {m}
            </span>
          ))}
          {hiddenCount > 0 && (
            <button
              onClick={() => setShowAll(true)}
              style={{
                fontSize: 11, fontWeight: 600,
                padding: '3px 9px', borderRadius: 6,
                background: 'transparent',
                border: `1px dashed ${colors.border}`,
                color: colors.textLight, cursor: 'pointer',
                fontFamily: fonts.family,
              }}
            >
              +{hiddenCount} more
            </button>
          )}
        </div>
      </div>

      <button
        onClick={onOrder}
        style={{
          width: '100%',
          background: isRecommended ? colors.spice : '#fff',
          color: isRecommended ? '#fff' : colors.spice,
          border: `${isRecommended ? 0 : 1}px solid ${colors.spice}`,
          padding: '11px 20px',
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          gap: 6,
          fontFamily: fonts.family,
          boxShadow: isRecommended ? '0 3px 12px rgba(122, 66, 50, 0.25)' : 'none',
        }}
      >
        Get this kit <ArrowRight size={14} />
      </button>
    </div>
  );
}

function ConfirmationView({ kit, onClose }) {
  return (
    <div style={{ padding: '40px 28px', textAlign: 'center' }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: '#E8F5E9',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
      }}>
        <Check size={32} color={colors.sage} />
      </div>
      <h2 style={{
        fontSize: 24, fontFamily: fonts.serif, fontWeight: 400,
        color: colors.text, margin: '0 0 12px',
        letterSpacing: -0.3,
      }}>
        Your {kit.name.toLowerCase()} is on the way
      </h2>
      <p style={{ fontSize: 15, color: colors.textLight, margin: '0 0 24px', lineHeight: 1.6, maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>
        Expect it in your mailbox in 2–3 business days. Once you mail your sample back,
        results land in your Eve dashboard within 5–7 days — no separate accounts to juggle.
      </p>

      <div style={{
        background: colors.bg,
        borderRadius: 12,
        padding: 18,
        textAlign: 'left',
        marginBottom: 20,
        maxWidth: 460, marginLeft: 'auto', marginRight: 'auto',
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 10px' }}>
          What happens next
        </p>
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: colors.text, lineHeight: 1.8 }}>
          <li>Kit arrives in 2–3 business days</li>
          <li>Finger prick at home — takes about 5 minutes</li>
          <li>Drop pre-paid envelope in any mailbox</li>
          <li>Results auto-load into your Biomarkers tab</li>
        </ol>
      </div>

      <button
        onClick={onClose}
        style={{
          background: colors.spice,
          color: '#fff',
          border: 'none',
          padding: '12px 28px',
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: fonts.family,
          boxShadow: '0 4px 16px rgba(122, 66, 50, 0.25)',
        }}
      >
        Back to my dashboard
      </button>
    </div>
  );
}
