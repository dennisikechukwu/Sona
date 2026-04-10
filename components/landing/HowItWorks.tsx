import { steps } from "./landing-data";

/* Step-by-step "How Sona works" section */
export default function HowItWorks() {
  return (
    <section id="how" style={{ padding: "6rem 1.5rem", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem, 4vw, 2.6rem)", fontWeight: 900, letterSpacing: "-0.025em", marginBottom: "0.75rem", color: "var(--text-primary)" }}>
          How Sona works
        </h2>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(0.875rem, 2vw, 1rem)", color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.75 }}>
          Three steps. Zero friction. Under 30 seconds to get started.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {steps.map((s, i) => (
          <div
            key={i}
            className="step-row"
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(34,197,94,0.2)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
          >
            {/* Step number */}
            <div style={{ width: 48, height: 48, background: "var(--accent-dim)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-serif)", fontWeight: 900, fontSize: "1.3rem", color: "var(--accent)", flexShrink: 0 }}>
              {i + 1}
            </div>

            {/* Text */}
            <div>
              <div style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "clamp(0.95rem, 2vw, 1.1rem)", marginBottom: "0.4rem", color: "var(--text-primary)" }}>{s.title}</div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.7, fontWeight: 300 }}>{s.desc}</div>
            </div>

            {/* Step image (hidden on mobile via CSS) */}
            <img src={`/images/step-${i + 1}.jpg`} alt={s.title} className="step-img" />
          </div>
        ))}
      </div>
    </section>
  );
}
