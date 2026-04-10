import { pricing } from "./landing-data";

interface Props {
  startMeeting: () => void;
}

/* Pricing cards — Free / Pro / Team */
export default function Pricing({ startMeeting }: Props) {
  return (
    <section id="pricing" style={{ padding: "6rem 1.5rem", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem, 4vw, 2.6rem)", fontWeight: 900, letterSpacing: "-0.025em", marginBottom: "0.75rem", color: "var(--text-primary)" }}>
          Simple, honest pricing
        </h2>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(0.875rem, 2vw, 1rem)", color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.75 }}>
          Start free. Upgrade when you need more.
        </p>
      </div>

      <div className="pricing-grid">
        {pricing.map((p, i) => (
          <div
            key={i}
            className={p.featured ? "pricing-featured" : ""}
            style={{
              background: p.featured ? "var(--accent-dim)" : "var(--bg-surface)",
              border: `1px solid ${p.featured ? "rgba(34,197,94,0.4)" : "var(--border-subtle)"}`,
              borderRadius: "var(--radius-lg)", padding: "1.75rem", position: "relative",
              boxShadow: p.featured ? "0 0 40px rgba(34,197,94,0.12)" : "none",
            }}
          >
            {/* "Most Popular" badge */}
            {p.featured && (
              <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "var(--accent)", color: "#000", borderRadius: 999, padding: "3px 14px", fontSize: "0.68rem", fontWeight: 700, fontFamily: "var(--font-sans)", whiteSpace: "nowrap" }}>
                Most Popular
              </div>
            )}

            {/* Plan name */}
            <div style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.05rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>{p.name}</div>

            {/* Price */}
            <div style={{ marginBottom: "1.25rem" }}>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", fontWeight: 900, color: p.featured ? "var(--accent)" : "var(--text-primary)" }}>{p.price}</span>
              {p.period && <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--text-muted)" }}>{p.period}</span>}
            </div>

            {/* Description */}
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "1.25rem", lineHeight: 1.65, fontWeight: 300 }}>{p.desc}</div>

            {/* Feature list */}
            {p.features.map((f, j) => (
              <div key={j} style={{ display: "flex", gap: 8, marginBottom: "0.55rem", alignItems: "flex-start" }}>
                <span style={{ color: "var(--accent)", fontSize: "0.8rem", marginTop: 1 }}>✓</span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 300 }}>{f}</span>
              </div>
            ))}

            {/* CTA button */}
            <button
              onClick={startMeeting}
              style={{ width: "100%", marginTop: "1.25rem", background: p.featured ? "var(--accent)" : "var(--bg-elevated)", border: `1px solid ${p.featured ? "transparent" : "var(--border-default)"}`, borderRadius: "var(--radius-md)", padding: "0.75rem", color: p.featured ? "#000" : "var(--text-primary)", fontFamily: "var(--font-sans)", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", transition: "opacity 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {p.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
