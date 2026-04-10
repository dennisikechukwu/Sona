export default function SonaLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="13" fill="var(--accent)" opacity="0.12" />
      <circle cx="14" cy="14" r="9"  fill="var(--accent)" opacity="0.22" />
      <circle cx="14" cy="14" r="5"  fill="var(--accent)" opacity="0.5"  />
      <circle cx="14" cy="14" r="2.5" fill="var(--accent)" />
    </svg>
  );
}
