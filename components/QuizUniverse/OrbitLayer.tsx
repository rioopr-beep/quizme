// ============================================================================
// OrbitLayer — jalur orbit dekoratif di belakang planet topik.
// Murni SVG statis (tidak dianimasikan lewat JS), ringan, aria-hidden.
// ============================================================================

export default function OrbitLayer(): JSX.Element {
  return (
    <svg
      viewBox="0 0 320 320"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse
        cx="160"
        cy="160"
        rx="148"
        ry="86"
        fill="none"
        stroke="#5b7fd6"
        strokeOpacity="0.14"
        strokeWidth="1"
      />
      <ellipse
        cx="160"
        cy="160"
        rx="108"
        ry="140"
        fill="none"
        stroke="#5b7fd6"
        strokeOpacity="0.08"
        strokeWidth="1"
        transform="rotate(35 160 160)"
      />
      <ellipse
        cx="160"
        cy="160"
        rx="132"
        ry="62"
        fill="none"
        stroke="#93a0bd"
        strokeOpacity="0.12"
        strokeWidth="1"
        transform="rotate(-28 160 160)"
      />
    </svg>
  );
}
