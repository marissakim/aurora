import { ExternalLink } from 'lucide-react';
import { colors, cardStyle } from '../../theme';
import { costData, financialResources } from '../../data/costs';

const costBreakdown = [
  { pathway: 'IVF', cost: '$15K–$30K', note: 'Includes medications, monitoring, retrieval, and transfer. May need multiple cycles.' },
  { pathway: 'Egg Freezing', cost: '$8K–$18K', note: 'Plus $500–$1K/year storage. Consider freezing before age 35 for best outcomes.' },
  { pathway: 'IUI', cost: '$500–$4K', note: 'Per cycle including monitoring. Typically 3–6 cycles recommended before reassessing.' },
];

const fmt = v => v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`;
const maxVal = Math.max(...costData.map(d => d.high));

function CostBar({ item }) {
  const lowPct = Math.max((item.low / maxVal) * 100, 1);
  const avgPct = Math.max((item.average / maxVal) * 100, 2);
  const highPct = Math.max((item.high / maxVal) * 100, 3);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{item.pathway}</span>
        <span style={{ fontSize: 13, color: colors.textLight }}>{fmt(item.low)} – {fmt(item.high)}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ height: 10, width: `${highPct}%`, background: colors.rose, borderRadius: 5, transition: 'width 0.5s' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ height: 10, width: `${avgPct}%`, background: colors.plum, borderRadius: 5, transition: 'width 0.5s' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ height: 10, width: `${lowPct}%`, background: colors.teal, borderRadius: 5, transition: 'width 0.5s' }} />
        </div>
      </div>
    </div>
  );
}

export default function Costs() {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: colors.text, margin: '0 0 8px' }}>Cost Comparison</h2>
      <p style={{ fontSize: 14, color: colors.textLight, margin: '0 0 20px' }}>
        National averages for 2025–2026. Actual costs vary by location, clinic, and insurance.
      </p>

      {/* Bar Chart */}
      <div style={{ ...cardStyle, marginBottom: 24, padding: 24 }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          {[{ label: 'High', color: colors.rose }, { label: 'Average', color: colors.plum }, { label: 'Low', color: colors.teal }].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: l.color }} />
              <span style={{ fontSize: 12, color: colors.textLight }}>{l.label}</span>
            </div>
          ))}
        </div>
        {costData.map(item => <CostBar key={item.pathway} item={item} />)}
      </div>

      {/* Cost Breakdown */}
      <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.text, margin: '0 0 12px' }}>Your Cost Breakdown</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        {costBreakdown.map(item => (
          <div key={item.pathway} style={cardStyle}>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: colors.plum, margin: '0 0 4px' }}>{item.pathway}</h4>
            <p style={{ fontSize: 22, fontWeight: 800, color: colors.text, margin: '0 0 8px' }}>{item.cost}</p>
            <p style={{ fontSize: 13, color: colors.textLight, margin: 0, lineHeight: 1.5 }}>{item.note}</p>
          </div>
        ))}
      </div>

      {/* Financial Resources */}
      <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.text, margin: '0 0 12px' }}>Financial Resources</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {financialResources.map(res => (
          <a
            key={res.name}
            href={res.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...cardStyle,
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
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
              fontSize: 20,
            }}>
              {res.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: colors.text, margin: 0 }}>{res.name}</h4>
                <ExternalLink size={12} color={colors.textLight} />
              </div>
              <p style={{ fontSize: 12, fontWeight: 600, color: colors.spice, margin: '0 0 4px' }}>{res.tagline}</p>
              <p style={{ fontSize: 13, color: colors.textLight, margin: 0, lineHeight: 1.5 }}>{res.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
