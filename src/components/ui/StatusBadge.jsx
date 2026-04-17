import { colors } from '../../theme';

const variants = {
  good: { bg: '#E8F5E9', color: colors.sage, label: 'On Track' },
  attention: { bg: '#FFF3E0', color: '#E0901A', label: 'Needs Attention' },
  critical: { bg: '#FFEBEE', color: '#D32F2F', label: 'Action Required' },
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
