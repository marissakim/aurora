import { useState } from 'react';
import { Search, Star, MapPin, TrendingUp, DollarSign } from 'lucide-react';
import { colors, cardStyle, gradients } from '../../theme';
import { clinics } from '../../data/clinics';

const filters = ['IVF Clinics', 'Egg Donors', 'Surrogacy Agencies'];

export default function FindClinics({ profile }) {
  const [activeFilter, setActiveFilter] = useState('IVF Clinics');
  const location = profile.location || 'SF Bay Area';

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: colors.text, margin: '0 0 20px' }}>Find Clinics</h2>

      {/* Search */}
      <div style={{
        ...cardStyle, padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
      }}>
        <Search size={18} color={colors.textLight} />
        <input
          type="text"
          defaultValue={location}
          placeholder="Search by location..."
          style={{
            border: 'none', outline: 'none', flex: 1,
            fontSize: 15, color: colors.text, fontFamily: 'Arial, sans-serif',
            background: 'transparent',
          }}
        />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: '8px 18px',
              borderRadius: 10,
              border: `2px solid ${activeFilter === f ? colors.plum : colors.border}`,
              background: activeFilter === f ? '#F3E8FF' : '#fff',
              color: activeFilter === f ? colors.plum : colors.textLight,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Clinic cards */}
      {activeFilter === 'IVF Clinics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          {clinics.map(clinic => (
            <div key={clinic.name} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.text, margin: '0 0 6px' }}>{clinic.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Star size={14} color={colors.gold} fill={colors.gold} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{clinic.rating}</span>
                    <span style={{ fontSize: 13, color: colors.textLight }}>
                      &middot; <MapPin size={12} style={{ verticalAlign: -1 }} /> {clinic.location} &middot; {clinic.distance}
                    </span>
                  </div>
                </div>
                <button style={{
                  background: '#F3E8FF',
                  color: colors.plum,
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}>
                  View Details
                </button>
              </div>
              <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TrendingUp size={14} color={colors.sage} />
                  <span style={{ fontSize: 13, color: colors.text }}><strong>{clinic.successRate}</strong> live birth rate</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <DollarSign size={14} color={colors.teal} />
                  <span style={{ fontSize: 13, color: colors.text }}><strong>{clinic.avgCost}</strong> avg cost</span>
                </div>
              </div>
              <p style={{ fontSize: 13, color: colors.textLight, margin: '8px 0 0' }}>{clinic.specialty}</p>
            </div>
          ))}
        </div>
      )}

      {activeFilter !== 'IVF Clinics' && (
        <div style={{ ...cardStyle, textAlign: 'center', padding: 40 }}>
          <p style={{ fontSize: 16, color: colors.textLight, margin: 0 }}>
            {activeFilter === 'Egg Donors' ? 'Donor database coming in V2.' : 'Surrogacy agency directory coming in V2.'}
          </p>
        </div>
      )}

      {/* Donor CTA */}
      <div style={{
        borderRadius: 14, padding: 24, marginBottom: 16,
        background: gradients.purpleRose,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Explore Donors</h3>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: 0 }}>Browse egg and sperm donor profiles.</p>
        </div>
        <button style={{
          background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
          padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>
          Coming Soon
        </button>
      </div>

      {/* Surrogacy CTA */}
      <div style={{
        borderRadius: 14, padding: 24,
        background: gradients.tealGold,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Explore Surrogacy</h3>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: 0 }}>Connect with surrogacy agencies.</p>
        </div>
        <button style={{
          background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
          padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>
          Coming Soon
        </button>
      </div>
    </div>
  );
}
