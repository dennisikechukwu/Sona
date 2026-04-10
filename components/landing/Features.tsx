import { features } from "./landing-data";

/* Feature cards grid — "Everything your meetings are missing" */
export default function Features() {
  return (
    <section id="features" style={{ padding: "5rem 1.5rem", background: "var(--bg-surface)", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem, 4vw, 2.6rem)", fontWeight: 900, letterSpacing: "-0.025em", marginBottom: "0.75rem", color: "var(--text-primary)" }}>
            Everything your meetings are missing
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(0.875rem, 2vw, 1rem)", color: "var(--text-secondary)", fontWeight: 300, maxWidth: 480, margin: "0 auto", lineHeight: 1.75 }}>
            Sona runs silently in every call — no setup, no bots, no friction.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "1rem" }}>
          {features.map((f, i) => (
            <div
              key={i}
              style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "1.75rem", transition: "border-color 0.2s, transform 0.2s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(34,197,94,0.25)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
            >
              <div style={{ width: 48, height: 48, background: "var(--accent-dim)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", marginBottom: "1.1rem" }}>
                {f.icon}
              </div>
              <div style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.55rem", color: "var(--text-primary)" }}>{f.title}</div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.7, fontWeight: 300 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
