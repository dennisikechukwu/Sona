import { mockParticipants } from "./landing-data";

type Participant = typeof mockParticipants[0];

/* Single video tile shown inside the app preview mock */
export default function MockTile({ p, idx }: { p: Participant; idx: number }) {
  return (
    <div style={{
      background: p.bg,
      borderRadius: 8,
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
      border: p.speaking ? `1px solid ${p.color}55` : "1px solid rgba(255,255,255,0.03)",
    }}>
      {/* Avatar circle */}
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        background: `${p.color}20`, border: `2px solid ${p.color}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "0.85rem", color: p.color,
        boxShadow: p.speaking ? `0 0 20px ${p.color}44` : "none",
        position: "relative", zIndex: 1,
      }}>
        {p.initials}
      </div>

      {/* Waveform bars (speaking only) */}
      {p.speaking && (
        <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 2, alignItems: "center", zIndex: 1 }}>
          {[0.5, 0.9, 0.6, 1, 0.7, 0.85, 0.5].map((h, i) => (
            <div key={i} style={{ width: 2, height: `${h * 11}px`, background: p.color, borderRadius: 1, opacity: 0.85, animation: `waveform ${0.35 + i * 0.08}s ease-in-out infinite alternate`, animationDelay: `${i * 0.04}s` }} />
          ))}
        </div>
      )}

      {/* Name tag */}
      <div style={{ position: "absolute", bottom: 6, left: 6, background: "rgba(6,8,12,0.88)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 999, padding: "2px 8px", display: "flex", alignItems: "center", gap: 4, zIndex: 1 }}>
        {p.speaking && (
          <div style={{ display: "flex", gap: 1, alignItems: "center" }}>
            {[0.6, 1, 0.7].map((h, i) => (
              <div key={i} style={{ width: 2, height: `${h * 6}px`, background: p.color, borderRadius: 1, animation: `waveform ${0.3 + i * 0.1}s ease-in-out infinite alternate` }} />
            ))}
          </div>
        )}
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.6rem", color: "var(--text-primary)" }}>{p.name}</span>
        {p.muted && <span style={{ fontSize: "0.55rem" }}>🔇</span>}
      </div>

      {/* suppress unused idx warning */}
      <span style={{ display: "none" }}>{idx}</span>
    </div>
  );
}
