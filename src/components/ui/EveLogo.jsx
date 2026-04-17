// Custom Eve logo mark: a stylized apple with a leaf — evoking the
// fruit of the tree of knowledge from the Eden story. Drawn in a clean
// single-stroke style to match the rest of the design system.
export default function EveLogo({ size = 48, color = 'currentColor', strokeWidth = 1.5 }) {
  return (
    <svg
      width={size}
      height={size * (56 / 48)}
      viewBox="0 0 48 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Eve"
    >
      <g
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Apple body — slightly heart-shaped with a soft top dimple */}
        <path d="M24 22 C13 22, 7 30, 7 39 C7 48, 14 54, 24 54 C34 54, 41 48, 41 39 C41 30, 35 22, 24 22 Z" />
        {/* Subtle dimple at top of the apple */}
        <path d="M19 24 C21 22, 23 22, 24 23 C25 22, 27 22, 29 24" opacity="0.7" />
        {/* Stem */}
        <path d="M24 22 L24 14" />
        {/* Leaf curving off the stem */}
        <path d="M24 14 C28 8, 35 7, 40 10 C38 17, 32 20, 25 16" />
      </g>
    </svg>
  );
}
