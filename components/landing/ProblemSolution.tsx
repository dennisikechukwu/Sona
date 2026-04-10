import { IconArrow } from "./landing-icons";
import { problemPoints, solutionPoints } from "./landing-data";

/* "The problem with meetings" / before-after comparison */
export default function ProblemSolution() {
  return (
    <section style={{ padding: "6rem 1.5rem", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem, 4vw, 2.8rem)", fontWeight: 900, letterSpacing: "-0.025em", marginBottom: "0.875rem", color: "var(--text-primary)" }}>
          The problem with meetings
        </h2>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(0.875rem, 2vw, 1rem)", color: "var(--text-secondary)", fontWeight: 300, maxWidth: 500, margin: "0 auto", lineHeight: 1.75 }}>
          The average professional spends 3+ hours in meetings every day. Most of it evaporates.
        </p>
      </div>

      <div className="ps-grid">
        {/* Without Sona */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "1.75rem", borderTop: "3px solid var(--red)" }}>
          <div style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.05rem", color: "var(--red)", marginBottom: "1.25rem" }}>Without Sona</div>
          {problemPoints.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: "0.85rem", alignItems: "flex-start" }}>
              <span style={{ color: "var(--red)", flexShrink: 0, marginTop: 1 }}>✕</span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.865rem", color: "var(--text-secondary)", lineHeight: 1.6, fontWeight: 300 }}>{p}</span>
            </div>
          ))}
        </div>

        {/* Arrow divider */}
        <div className="ps-arrow">
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--accent-dim)", border: "1px solid rgba(34,197,94,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
            <IconArrow />
          </div>
        </div>

        {/* With Sona */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "1.75rem", borderTop: "3px solid var(--accent)" }}>
          <div style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.05rem", color: "var(--accent)", marginBottom: "1.25rem" }}>With Sona</div>
          {solutionPoints.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: "0.85rem", alignItems: "flex-start" }}>
              <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }}>✓</span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.865rem", color: "var(--text-secondary)", lineHeight: 1.6, fontWeight: 300 }}>{p}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
