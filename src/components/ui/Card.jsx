import { cardStyle } from '../../theme';

export default function Card({ children, style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{ ...cardStyle, ...style, cursor: onClick ? 'pointer' : 'default' }}
    >
      {children}
    </div>
  );
}
