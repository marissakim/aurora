import { useState, useEffect } from 'react';
import { Search, Star, MapPin, TrendingUp, DollarSign, ExternalLink, Video } from 'lucide-react';
import { colors, cardStyle, gradients, fonts } from '../../theme';
import { clinics, clinicsForLocation } from '../../data/clinics';
import { telehealthProviders } from '../../data/telehealth';
import { eggDonorOptions, spermDonorOptions, surrogacyAgencies } from '../../data/donorAgencies';

const filters = ['Virtual Care', 'IVF Clinics', 'Egg Donors', 'Surrogacy Agencies'];

export default function FindClinics({ profile, initialFilter }) {
  const [activeFilter, setActiveFilter] = useState(initialFilter || 'Virtual Care');
  const location = profile.location || 'SF Bay Area';

  // Allow parent to change filter after mount (e.g., when navigating from My Index hero card)
  useEffect(() => {
    if (initialFilter) setActiveFilter(initialFilter);
  }, [initialFilter]);

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
            fontSize: 15, color: colors.text, fontFamily: fonts.family,
            background: 'transparent',
          }}
        />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: '8px 18px',
              borderRadius: 10,
              border: `2px solid ${activeFilter === f ? colors.plum : colors.border}`,
              background: activeFilter === f ? '#F0EAEC' : '#fff',
              color: activeFilter === f ? colors.plum : colors.textLight,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: fonts.family,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Virtual Care (Telehealth) */}
      {activeFilter === 'Virtual Care' && (
        <>
          <div style={{
            background: 'linear-gradient(135deg, #E0F2F1 0%, #FFF8E1 100%)',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: colors.teal,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Video size={18} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: '0 0 4px' }}>
                A lighter first step
              </p>
              <p style={{ fontSize: 13, color: colors.textLight, margin: 0, lineHeight: 1.5 }}>
                Virtual consultations typically cost $25–$250 (vs $500+ for clinic intake), can be booked in days, and help you understand your options before committing to a clinic.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            {telehealthProviders.map(provider => (
              <div key={provider.name} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 12, flex: 1 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10,
                      background: colors.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, flexShrink: 0,
                    }}>
                      {provider.icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: colors.text, margin: '0 0 2px' }}>{provider.name}</h3>
                      <p style={{ fontSize: 13, fontWeight: 600, color: colors.teal, margin: '0 0 8px' }}>
                        {provider.tagline}
                      </p>
                    </div>
                  </div>
                  <a
                    href={provider.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: gradients.tealGold,
                      color: '#fff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Visit Site <ExternalLink size={13} />
                  </a>
                </div>
                <p style={{ fontSize: 13, color: colors.text, margin: '0 0 10px', lineHeight: 1.5 }}>
                  {provider.description}
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                  {provider.offerings.map(o => (
                    <span key={o} style={{
                      fontSize: 11, fontWeight: 600,
                      padding: '3px 10px', borderRadius: 6,
                      background: '#E0F2F1', color: colors.teal,
                    }}>
                      {o}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: colors.textLight, gap: 16, flexWrap: 'wrap' }}>
                  <span><DollarSign size={12} style={{ verticalAlign: -1 }} /> {provider.costRange}</span>
                  <span style={{ textAlign: 'right' }}>Ideal for: {provider.idealFor}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Clinic cards */}
      {activeFilter === 'IVF Clinics' && (() => {
        const userLocation = profile.location;
        const supportedCities = ['SF Bay Area', 'LA', 'NYC'];
        const isSupported = supportedCities.includes(userLocation);
        const filteredClinics = clinicsForLocation(userLocation);
        return (
        <>
          {!isSupported && (
            <div style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F7EBE6 100%)',
              border: `1px solid ${colors.border}`,
              borderLeft: `3px solid ${colors.spice}`,
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 16,
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: colors.text, margin: '0 0 4px' }}>
                We&apos;re starting with SF, LA, and NYC
              </p>
              <p style={{ fontSize: 13, color: colors.textLight, margin: 0, lineHeight: 1.5 }}>
                You&apos;re outside our currently-covered metros — showing all clinics below. For your area, SART.org has the most complete verified list and virtual care remains a strong first step.
              </p>
            </div>
          )}
          {isSupported && (
            <p style={{ fontSize: 12, color: colors.textLight, margin: '0 0 12px', fontStyle: 'italic' }}>
              Showing {filteredClinics.length} clinics in {userLocation}.
            </p>
          )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          {filteredClinics.map(clinic => (
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
                <a
                  href={clinic.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: colors.spice,
                    color: '#FBF9F5',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  Visit Site <ExternalLink size={12} />
                </a>
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
        </>
        );
      })()}

      {activeFilter === 'Egg Donors' && (
        <>
          <SectionExplainer
            color={colors.spice}
            title="Two models for donor eggs"
            text={<>Most donor-egg journeys fall into <strong>fresh/matched</strong> (pick a donor, synchronize cycles) or <strong>frozen bank</strong> (purchase a cohort that&apos;s ready now). Matched is more personalized and typically more expensive; frozen is faster and lower cost.</>}
          />
          <DirectorySection title="Egg Donor Programs" items={eggDonorOptions} />
          <DirectorySection title="Sperm Donor Banks" items={spermDonorOptions} compact />
        </>
      )}

      {activeFilter === 'Surrogacy Agencies' && (
        <>
          <SectionExplainer
            color={colors.teal}
            title="State law matters more than agency choice"
            text={<>Only ~15 US states have clear surrogacy-friendly statutes. Most agencies can work across state lines but it changes timelines and cost. A reproductive lawyer consult (~$300–$500) before signing with an agency can prevent expensive re-matching.</>}
          />
          <DirectorySection title="Full-Service Surrogacy Agencies" items={surrogacyAgencies} surrogacy />
        </>
      )}

      {/* Cross-nav cards — only show on tabs OTHER than what they point to */}
      {activeFilter !== 'Egg Donors' && (
        <div
          onClick={() => setActiveFilter('Egg Donors')}
          style={{
            borderRadius: 14, padding: 20, marginBottom: 16,
            background: gradients.spiceDeep,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            cursor: 'pointer',
          }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>Explore Egg Donor Programs</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: 0 }}>Cofertility, Fairfax EggBank, Donor Egg Bank USA, and more.</p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
            padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600,
          }}>
            View →
          </div>
        </div>
      )}

      {activeFilter !== 'Surrogacy Agencies' && (
        <div
          onClick={() => setActiveFilter('Surrogacy Agencies')}
          style={{
            borderRadius: 14, padding: 20,
            background: gradients.tealGold,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            cursor: 'pointer',
          }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>Explore Surrogacy Agencies</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: 0 }}>Circle Surrogacy, ConceiveAbilities, Growing Generations, and more.</p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
            padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600,
          }}>
            View →
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section explainer banner (donor vs frozen, state law, etc) ──────
function SectionExplainer({ color, title, text }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #FFFFFF 0%, #F7EBE6 100%)',
      border: `1px solid ${colors.border}`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 10,
      padding: '12px 16px',
      marginBottom: 16,
    }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: colors.text, margin: '0 0 4px' }}>{title}</p>
      <p style={{ fontSize: 13, color: colors.textLight, margin: 0, lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}

// ─── Directory of donor/surrogacy providers, rendered as cards ──────
function DirectorySection({ title, items, compact, surrogacy }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{
        fontSize: 14, fontWeight: 700, color: colors.text,
        textTransform: 'uppercase', letterSpacing: 0.5,
        margin: '8px 0 12px',
      }}>
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(item => (
          <div key={item.name} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 0 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: colors.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: colors.text, margin: '0 0 2px' }}>
                    {item.name}
                  </h4>
                  <p style={{ fontSize: 13, fontWeight: 600, color: colors.spice, margin: 0 }}>
                    {item.tagline}
                  </p>
                </div>
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: colors.spice,
                  color: '#FBF9F5',
                  border: 'none',
                  padding: '7px 14px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  whiteSpace: 'nowrap',
                }}
              >
                Visit Site <ExternalLink size={12} />
              </a>
            </div>

            {!compact && (
              <p style={{ fontSize: 13, color: colors.text, margin: '10px 0', lineHeight: 1.5 }}>
                {item.description}
              </p>
            )}

            <div style={{
              display: 'flex', gap: 16, flexWrap: 'wrap',
              fontSize: 12, color: colors.textLight,
              marginTop: compact ? 10 : 8,
            }}>
              {item.model && <span>{item.model}</span>}
              {item.costRange && <span>💳 {item.costRange}</span>}
              {item.timeline && <span>⏱ {item.timeline}</span>}
            </div>
            {item.specialty && (
              <p style={{
                fontSize: 12, color: colors.textLight, margin: '6px 0 0',
                fontStyle: 'italic',
              }}>
                Best for: {item.specialty}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
