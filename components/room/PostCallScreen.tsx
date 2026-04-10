import type { TranscriptLine } from "@/lib/types";

interface TaskItem { text: string; owner: string; due: string; done: boolean; }

interface Props {
  totalSeconds: number;
  liveLines: TranscriptLine[];
  summary: string;
  keyTopics: string[];
  tasks: TaskItem[];
  onDashboard: () => void;
  onProfile: () => void;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/* Full-screen summary shown to the host after "End for everyone" */
export default function PostCallScreen({ totalSeconds, liveLines, summary, keyTopics, tasks, onDashboard, onProfile }: Props) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 560, animation: "fadeIn 0.4s ease" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--accent-dim)", border: "2px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", fontSize: "1.5rem" }}>
            ✓
          </div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 900, fontSize: "1.6rem", color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "0.35rem" }}>
            Meeting ended
          </h1>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Duration: {formatTime(totalSeconds)} · {liveLines.length} transcript lines
          </p>
        </div>

        {/* AI Summary card */}
        {summary && (
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-xl)", padding: "1.5rem", marginBottom: "1rem" }}>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem" }}>AI Summary</div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.75, fontWeight: 300, margin: 0 }}>{summary}</p>
            {keyTopics.length > 0 && (
              <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: 4 }}>
                {keyTopics.map((t, i) => (
                  <span key={i} style={{ background: "var(--accent-dim)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "var(--radius-full)", padding: "3px 10px", fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--accent)" }}>{t}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action items card */}
        {tasks.length > 0 && (
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-xl)", padding: "1.5rem", marginBottom: "1rem" }}>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Action Items</div>
            {tasks.map((task, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "0.6rem 0", borderBottom: i < tasks.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, border: "1.5px solid var(--border-strong)", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--text-primary)" }}>{task.text}</div>
                  {(task.owner || task.due) && (
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 2 }}>
                      {task.owner && <span style={{ color: "var(--accent)", marginRight: 8 }}>{task.owner}</span>}
                      {task.due && `Due: ${task.due}`}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No transcript fallback */}
        {!summary && liveLines.length === 0 && (
          <div style={{ background: "var(--bg-surface)", border: "1px dashed var(--border-default)", borderRadius: "var(--radius-xl)", padding: "2rem", textAlign: "center", marginBottom: "1rem" }}>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              No transcript was captured during this session.
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
          <button
            onClick={onDashboard}
            style={{ flex: 1, background: "var(--accent)", color: "#000", border: "none", borderRadius: "var(--radius-md)", padding: "0.875rem", fontFamily: "var(--font-sans)", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", transition: "opacity 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Go to dashboard
          </button>
          <button
            onClick={onProfile}
            style={{ flex: 1, background: "var(--bg-surface)", color: "var(--text-secondary)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "0.875rem", fontFamily: "var(--font-sans)", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", transition: "border-color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(34,197,94,0.4)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
          >
            View in profile
          </button>
        </div>
      </div>
    </div>
  );
}
