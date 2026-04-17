// Eve — a more modern, earthy-wellness palette.
// Previously "Aurora" (dawn-inspired purple/rose/coral). Shifted to
// aubergine + terracotta + muted sage for a more grounded, sophisticated feel.
export const colors = {
  // Primary (renamed from plum for familiarity; still imported as `plum` everywhere)
  plum: '#3D2E3D',       // Deep aubergine
  rose: '#D9886E',       // Terracotta
  coral: '#B8794A',      // Caramel
  gold: '#C9A961',       // Muted gold
  sage: '#8B9F7E',       // Muted sage
  teal: '#6B8F8F',       // Dusty teal
  text: '#2B2B2B',       // Warm near-black
  textLight: '#7A7574',  // Warm gray
  border: '#E8E4DD',     // Warm cream
  bg: '#FBF9F5',         // Warm ivory
  white: '#FFFFFF',
  deepTwilight: '#1F1825', // Deep aubergine for hero backgrounds
};

export const gradients = {
  // Softer, warmer hero gradient — less dawn-rainbow, more sunset-at-dusk
  dawn: 'linear-gradient(180deg, #1F1825 0%, #3D2E3D 35%, #6B4F52 65%, #D9886E 100%)',
  purpleRose: 'linear-gradient(135deg, #3D2E3D, #D9886E)',
  roseGold: 'linear-gradient(135deg, #D9886E, #C9A961)',
  tealGold: 'linear-gradient(135deg, #6B8F8F, #C9A961)',
};

export const fonts = {
  // Modern system sans-serif stack (Inter-like where available)
  family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, "Helvetica Neue", Helvetica, sans-serif',
  // Serif for the wordmark — timeless and editorial
  serif: 'Georgia, "Times New Roman", serif',
};

export const cardStyle = {
  background: colors.white,
  borderRadius: 14,
  border: `1px solid ${colors.border}`,
  padding: 20,
};
