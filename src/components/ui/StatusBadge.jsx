import { colors } from '../../theme';

// Labels use a trusted-guide tone — suggestions, not alarms.
const variants = {
  good: { bg: '#E8F5E9', color: colors.sage, label: 'On Track' },
  attention: { bg: '#FFF3E0', color: '#A87030', label: 'Worth a Look' },
  critical: { bg: '#F7E5DF', color: colors.spice, label: 'Worth Discussing' },
};

export default function StatusBadge({ status }) {
  const v = variants[status] || variants.good;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 12,
      fontSize: 12,
      fontWeight: 600,
      backgroundColor: v.bg,
      color: v.color,
    }}>
      {v.label}
    </span>
  );
}
