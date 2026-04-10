import { testimonials } from "./landing-data";

interface Props {
  activeTesti: number;
  setActiveTesti: (i: number) => void;
}

/* Rotating testimonial cards */
export default function Testimonials({ activeTesti, setActiveTesti }: Props) {
  return (
    <section style={{ padding: "5rem 1.5rem", background: "var(--bg-surface)", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.4rem, 3.5vw, 2.2rem)", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "3rem", color: "var(--text-primary)" }}>
          What teams are saying
        </h2>

        {/* Cards */}
        <div style={{ position: "relative", minHeight: 220 }}>
          {testimonials.map((t, i) => (
            <div
              key={i}
              style={{ position: i === activeTesti ? "relative" : "absolute", top: 0, left: 0, right: 0, opacity: i === activeTesti ? 1 : 0, transition: "opacity 0.6s ease", pointerEvents: i === activeTesti ? "auto" : "none" }}
            >
              <div style={{ background: "var(--bg-base)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-xl)", padding: "clamp(1.5rem, 4vw, 2.5rem)" }}>
                {/* Stars */}
                <div style={{ display: "flex", justifyContent: "center", gap: 2, marginBottom: "1.25rem" }}>
                  {[1, 2, 3, 4, 5].map((s) => <span key={s} style={{ color: "#f59e0b", fontSize: "0.85rem" }}>★</span>)}
                </div>

                {/* Quote */}
                <blockquote style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(0.95rem, 2vw, 1.1rem)", fontStyle: "italic", color: "var(--text-primary)", lineHeight: 1.75, marginBottom: "1.5rem", fontWeight: 300 }}>
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                {/* Author */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${t.color}22`, border: `2px solid ${t.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "0.85rem", color: t.color, flexShrink: 0 }}>
                    {t.initials}
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>{t.name}</div>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--text-muted)" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dot navigation */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: "1.5rem" }}>
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveTesti(i)}
              style={{ width: i === activeTesti ? 24 : 8, height: 8, borderRadius: 999, background: i === activeTesti ? "var(--accent)" : "var(--border-default)", border: "none", cursor: "pointer", transition: "all 0.3s" }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
