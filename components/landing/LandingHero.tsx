import { IconVideo, IconArrow } from "./landing-icons";

interface Props {
  mounted: boolean;
  roomCode: string;
  setRoomCode: (v: string) => void;
  joinRoom: (e: React.SyntheticEvent) => void;
  startMeeting: () => void;
}

/* Hero section — headline, sub-copy, start button, join-by-code form */
export default function LandingHero({ mounted, roomCode, setRoomCode, joinRoom, startMeeting }: Props) {
  const fadeUp = (delay = 0): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "none" : "translateY(28px)",
    transition: `opacity 0.7s ${delay}s, transform 0.7s ${delay}s`,
  });

  return (
    <section className="hero-section" style={{ position: "relative", overflow: "hidden" }}>
      {/* Grid pattern */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)", backgroundSize: "60px 60px", opacity: 0.35, pointerEvents: "none" }} />
      {/* Radial glow */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(34,197,94,0.13) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 820, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>

        {/* Social proof pill */}
        <div className="hero-pill" style={{ justifyContent: "center", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-full)", padding: "7px 16px", marginBottom: "2.5rem", ...fadeUp(0) }}>
          <div style={{ display: "flex" }}>
            {["#22c55e", "#3b82f6", "#f59e0b"].map((c, i) => (
              <div key={i} style={{ width: 26, height: 26, borderRadius: "50%", background: `${c}33`, border: "2px solid var(--bg-surface)", marginLeft: i ? "-8px" : 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem", fontWeight: 700, color: c, fontFamily: "var(--font-sans)" }}>
                {["AK", "JO", "FN"][i]}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 1 }}>
            {[1, 2, 3, 4, 5].map((i) => <span key={i} style={{ color: "#f59e0b", fontSize: "0.75rem" }}>★</span>)}
          </div>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
            Loved by <strong style={{ color: "var(--text-primary)" }}>2,400+</strong> teams
          </span>
        </div>

        {/* Headline */}
        <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 900, fontSize: "clamp(2.2rem, 7vw, 4.8rem)", lineHeight: 1.08, letterSpacing: "-0.035em", color: "var(--text-primary)", marginBottom: "1.5rem", ...fadeUp(0.1) }}>
          Your meetings,<br />
          <em style={{ fontStyle: "italic", color: "var(--accent)" }}>finally understood.</em>
        </h1>

        {/* Sub-copy */}
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(1rem, 2vw, 1.1rem)", fontWeight: 300, color: "var(--text-secondary)", lineHeight: 1.8, maxWidth: 560, margin: "0 auto 0.75rem", ...fadeUp(0.2) }}>
          Sona is an AI-powered video call platform that transcribes every word, identifies every speaker, and hands you a clean summary with action items the moment your call ends.
        </p>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(0.82rem, 1.8vw, 0.95rem)", fontWeight: 300, color: "var(--text-muted)", lineHeight: 1.75, maxWidth: 480, margin: "0 auto 3rem", ...fadeUp(0.25) }}>
          No bots, no interruptions. Just your team and an AI co-pilot capturing every detail.
        </p>

        {/* CTA block */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.9rem", maxWidth: 480, margin: "0 auto", ...fadeUp(0.35) }}>
          {/* Start button */}
          <button
            onClick={startMeeting}
            style={{ width: "100%", background: "var(--accent)", color: "#000", border: "none", borderRadius: "var(--radius-md)", padding: "1rem 2rem", fontSize: "clamp(0.9rem, 2vw, 1rem)", fontWeight: 700, fontFamily: "var(--font-sans)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 0 40px rgba(34,197,94,0.3)", transition: "transform 0.15s, box-shadow 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 60px rgba(34,197,94,0.45)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 0 40px rgba(34,197,94,0.3)"; }}
          >
            <IconVideo />Start a free meeting now
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-sans)" }}>
            <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
            or join with a code
            <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
          </div>

          {/* Join form */}
          <form onSubmit={joinRoom} style={{ display: "flex", gap: 8, width: "100%" }}>
            <input
              type="text"
              placeholder="abc-def-123"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              style={{ flex: 1, background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "0.85rem 1rem", color: "var(--text-primary)", fontSize: "0.9rem", fontFamily: "var(--font-sans)", outline: "none", transition: "border-color 0.2s", minWidth: 0 }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
            />
            <button
              type="submit"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "0.85rem 1.1rem", color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 600, fontFamily: "var(--font-sans)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "background 0.2s", whiteSpace: "nowrap", flexShrink: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-elevated)")}
            >
              Join <IconArrow />
            </button>
          </form>


        </div>
      </div>
    </section>
  );
}
