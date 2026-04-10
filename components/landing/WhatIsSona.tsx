/* "What is Sona?" section — two-column text + image */
export default function WhatIsSona() {
  const tags = ["No downloads needed", "No bot joins your call", "Works in any browser", "Instant end-of-call summary"];

  return (
    <section style={{ padding: "5rem 1.5rem", background: "var(--bg-surface)", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
      <div className="what-grid">

        {/* Text column */}
        <div>
          <div style={{ display: "inline-block", background: "var(--accent-dim)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "var(--radius-full)", padding: "4px 14px", marginBottom: "1.25rem" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "var(--accent)", fontWeight: 600, letterSpacing: "0.05em" }}>WHAT IS SONA?</span>
          </div>

          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)", fontWeight: 900, lineHeight: 1.15, letterSpacing: "-0.025em", marginBottom: "1.25rem", color: "var(--text-primary)" }}>
            A video call app with an AI that actually pays attention
          </h2>

          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.975rem", color: "var(--text-secondary)", lineHeight: 1.8, fontWeight: 300, marginBottom: "1.5rem" }}>
            Sona is a full video call platform with a live AI layer built in. It transcribes in real time, identifies speakers, and automatically tracks key decisions—no bots, no friction. Get a structured summary and action items delivered seconds after your call ends.
          </p>

          <div style={{ marginTop: "1.75rem", display: "flex", flexWrap: "wrap", gap: "0.875rem" }}>
            {tags.map((tag) => (
              <div key={tag} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
                {tag}
              </div>
            ))}
          </div>
        </div>

        {/* Image column */}
        <div className="what-img" style={{ borderRadius: "var(--radius-xl)", overflow: "hidden", border: "1px solid var(--border-default)", aspectRatio: "4/3", position: "relative" }}>
          <img src="/images/sona-in-action.jpg" alt="Sona in action" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>
    </section>
  );
}
