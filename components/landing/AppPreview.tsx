import React from "react";
import MockTile from "./MockTile";
import { mockParticipants, transcriptLines } from "./landing-data";

interface Props {
  txRef: React.RefObject<HTMLDivElement | null>;
  txIdx: number;
}

/* Browser-frame app preview shown below the hero */
export default function AppPreview({ txRef, txIdx }: Props) {
  return (
    <section style={{ padding: "0 1.5rem 6rem", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-xl)", overflow: "hidden", boxShadow: "0 60px 140px rgba(0,0,0,0.8)" }}>

        {/* Fake browser bar */}
        <div style={{ height: 40, background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", padding: "0 16px", gap: 8 }}>
          {["#ef4444", "#f59e0b", "#22c55e"].map((c, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: c, opacity: 0.8 }} />
          ))}
          <div style={{ flex: 1, height: 24, background: "var(--bg-overlay)", borderRadius: 999, margin: "0 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", color: "var(--text-muted)" }}>sona.app/room/qk7-m3a-j9x</span>
          </div>
        </div>

        <div className="preview-wrap">
          {/* Video grid */}
          <div className="preview-video-grid">
            {mockParticipants.map((p, i) => <MockTile key={i} p={p} idx={i} />)}
          </div>

          {/* AI transcript sidebar */}
          <div className="preview-sidebar">
            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)" }}>
              {["Transcript", "Summary", "Tasks"].map((t, i) => (
                <div key={i} style={{ flex: 1, padding: "0.65rem 0.25rem", textAlign: "center", fontFamily: "var(--font-sans)", fontSize: "0.7rem", fontWeight: i === 0 ? 600 : 400, color: i === 0 ? "var(--accent)" : "var(--text-muted)", borderBottom: i === 0 ? "2px solid var(--accent)" : "2px solid transparent", cursor: "pointer" }}>{t}</div>
              ))}
            </div>

            {/* Transcript lines */}
            <div ref={txRef} style={{ flex: 1, overflowY: "auto", padding: "0.875rem" }}>
              {transcriptLines.slice(0, txIdx + 1).map((ln, i) => (
                <div key={i} style={{ marginBottom: "0.85rem", padding: ln.highlight ? "6px 8px" : "0", background: ln.highlight ? "var(--accent-dim)" : "transparent", borderLeft: ln.highlight ? "2px solid var(--accent)" : "none", borderRadius: ln.highlight ? "0 5px 5px 0" : "0" }}>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.64rem", color: "var(--accent)", fontWeight: 600, marginBottom: 2 }}>{ln.speaker} · {ln.time}</div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.76rem", color: "var(--text-primary)", lineHeight: 1.6, fontWeight: 300 }}>{ln.text}</div>
                </div>
              ))}

              {/* Typing indicator */}
              {txIdx < transcriptLines.length - 1 && (
                <div style={{ display: "flex", gap: 3, padding: "4px 0" }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--text-muted)", animation: `blink 1s infinite ${i * 0.2}s` }} />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar footer */}
            <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "0.6rem 0.875rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: "blink 1.4s infinite" }} />
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.67rem", color: "var(--text-muted)" }}>Sona AI · Live</span>
              </div>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.67rem", color: "var(--text-muted)" }}>End-to-End Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      <p style={{ textAlign: "center", fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "1.1rem" }}>
        The transcript above updates live — watch it stream in real time ↑
      </p>
    </section>
  );
}
