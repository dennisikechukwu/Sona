import React from "react";
import type { TranscriptLine } from "@/lib/types";

type Tab = "transcript" | "summary" | "tasks";

interface Props {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  transcriptRef: React.RefObject<HTMLDivElement | null>;
  liveLines: TranscriptLine[];
  typing: boolean;
  setSidebarOpen: (v: boolean) => void;
}

const TABS: { key: Tab; label: string }[] = [
  { key: "transcript", label: "Transcript" },
  { key: "summary",    label: "Summary" },
  { key: "tasks",      label: "Tasks" },
];

/* AI sidebar — tabs for transcript / summary / tasks during the call */
export default function AISidebar({ activeTab, setActiveTab, transcriptRef, liveLines, typing, setSidebarOpen }: Props) {
  return (
    <div className="room-ai-sidebar">
      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)", alignItems: "center", paddingRight: "0.5rem" }}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              flex: 1, padding: "0.75rem 0.25rem",
              background: "none", border: "none",
              borderBottom: activeTab === key ? "2px solid var(--accent)" : "2px solid transparent",
              color: activeTab === key ? "var(--accent)" : "var(--text-muted)",
              fontFamily: "var(--font-sans)", fontSize: "0.75rem",
              fontWeight: activeTab === key ? 600 : 400,
              cursor: "pointer", textTransform: "capitalize",
              transition: "color 0.2s", letterSpacing: "0.02em",
            }}
          >
            {label}
          </button>
        ))}
        {/* Mobile close button inside the sidebar itself */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="ai-sidebar-close"
          style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer", marginLeft: "auto", padding: "6px" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Content */}
      <div ref={transcriptRef} style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>

        {/* Transcript tab */}
        {activeTab === "transcript" && (
          <div>
            {liveLines.filter(Boolean).map((line, i) => (
              <div key={i} style={{ marginBottom: "1.1rem", padding: line.highlight ? "8px 10px" : "0", background: line.highlight ? "var(--accent-dim)" : "transparent", borderLeft: line.highlight ? "2px solid var(--accent)" : "none", borderRadius: line.highlight ? "0 var(--radius-sm) var(--radius-sm) 0" : "0" }}>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", color: "var(--accent)", fontWeight: 600, marginBottom: 3, letterSpacing: "0.03em" }}>
                  {line.speaker} · {line.time}
                </div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--text-primary)", lineHeight: 1.65, fontWeight: 300 }}>
                  {line.text}
                </div>
              </div>
            ))}

            {liveLines.length === 0 && !typing && (
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--text-muted)", textAlign: "center", marginTop: "2rem", lineHeight: 1.7 }}>
                Transcript will appear here as<br />you speak…
              </div>
            )}

            {typing && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", gap: 3 }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ width: 6, height: 6, background: "var(--text-muted)", borderRadius: "50%", animation: `blink 1s infinite ${i * 0.2}s` }} />
                  ))}
                </div>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "var(--text-muted)" }}>Transcribing…</span>
              </div>
            )}
          </div>
        )}

        {/* Summary tab */}
        {activeTab === "summary" && (
          <div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "var(--text-muted)", letterSpacing: "0.08em", fontWeight: 600, textTransform: "uppercase", marginBottom: "0.75rem" }}>AI Summary</div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
              Summary is generated when the host ends the call.
            </div>
          </div>
        )}

        {/* Tasks tab */}
        {activeTab === "tasks" && (
          <div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "var(--text-muted)", letterSpacing: "0.08em", fontWeight: 600, textTransform: "uppercase", marginBottom: "0.75rem" }}>Action Items</div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
              Action items will appear after the call ends.
            </div>
          </div>
        )}
      </div>

      {/* Footer status bar */}
      <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "0.6rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: "blink 1.5s infinite", display: "block" }} />
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "var(--text-muted)" }}>Sona AI · Groq powered</span>
        </div>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "var(--text-muted)" }}>{liveLines.length} lines</span>
      </div>
    </div>
  );
}
