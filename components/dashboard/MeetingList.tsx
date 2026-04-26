type Meeting = {
  id: string;
  room_id: string;
  title: string | null;
  started_at: string;
  ended_at: string | null;
  participant_count: number;
};

interface Props {
  meetings: Meeting[];
}

function formatDuration(started: string, ended: string | null) {
  if (!ended) return "In progress";
  const ms = new Date(ended).getTime() - new Date(started).getTime();
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

import { Mic, ArrowRight } from "lucide-react";

/* Past meetings list — links each row to /profile?meeting=<id> */
export default function MeetingList({ meetings }: Props) {
  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: "1rem", letterSpacing: "-0.01em" }}>
        Past meetings
      </h2>

      {meetings.length === 0 ? (
        <div style={{ background: "var(--bg-surface)", border: "1px dashed var(--border-default)", borderRadius: "var(--radius-lg)", padding: "3rem", textAlign: "center" }}>
          <div style={{ marginBottom: "0.75rem", display: "flex", justifyContent: "center" }}>
            <Mic size={32} color="var(--text-muted)" />
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Your meeting history will appear here after your first call.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {meetings.map((m) => (
            <a
              key={m.id}
              href={`/profile?meeting=${m.id}`}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "1.1rem 1.25rem", textDecoration: "none", transition: "border-color 0.2s, background 0.2s", flexWrap: "wrap", gap: "0.5rem" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(34,197,94,0.3)"; (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)"; (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)"; }}
            >
              {/* Left: icon + details */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                <div style={{ width: 38, height: 38, borderRadius: "var(--radius-md)", background: "var(--accent-dim)", border: "1px solid rgba(34,197,94,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Mic size={18} color="var(--accent)" />
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                    {m.title || `Meeting · ${m.room_id}`}
                  </div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
                    {formatDate(m.started_at)} · {m.participant_count} participant{m.participant_count !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {/* Right: duration + arrow */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: m.ended_at ? "var(--text-secondary)" : "var(--accent)", fontWeight: m.ended_at ? 400 : 600 }}>
                  {formatDuration(m.started_at, m.ended_at)}
                </span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--accent)", display: "flex", alignItems: "center", gap: 4 }}>
                  View <ArrowRight size={14} />
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
