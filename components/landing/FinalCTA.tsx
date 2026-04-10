import { IconVideo } from "./landing-icons";

interface Props {
  startMeeting: () => void;
}

/* Bottom call-to-action section before the footer */
export default function FinalCTA({ startMeeting }: Props) {
  return (
    <section style={{ padding: "clamp(4rem, 8vw, 7rem) 1.5rem", textAlign: "center", position: "relative", overflow: "hidden" }}>

      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(34,197,94,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem, 6vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "1rem", lineHeight: 1.1, color: "var(--text-primary)" }}>
          Ready to meet <em style={{ fontStyle: "italic", color: "var(--accent)" }}>smarter?</em>
        </h2>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(0.875rem, 2vw, 1rem)", color: "var(--text-secondary)", fontWeight: 300, maxWidth: 400, margin: "0 auto 2.5rem", lineHeight: 1.75 }}>
          Join thousands of teams who&apos;ve stopped taking notes and started actually listening.
        </p>

        <button
          onClick={startMeeting}
          style={{ background: "var(--accent)", color: "#000", border: "none", borderRadius: "var(--radius-md)", padding: "clamp(0.875rem, 2vw, 1.1rem) clamp(1.5rem, 4vw, 3rem)", fontSize: "clamp(0.9rem, 2vw, 1rem)", fontWeight: 700, fontFamily: "var(--font-sans)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10, boxShadow: "0 0 60px rgba(34,197,94,0.3)", transition: "transform 0.15s, box-shadow 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 80px rgba(34,197,94,0.5)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 0 60px rgba(34,197,94,0.3)"; }}
        >
          <IconVideo />Start your first meeting — it&apos;s free
        </button>

        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.875rem" }}>
          No credit card · No account · Just start talking
        </p>
      </div>
    </section>
  );
}
