import { ArrowRight } from "lucide-react";

interface Props {
  joinLink: string;
  setJoinLink: (v: string) => void;
  joining: boolean;
  joinError: string;
  joinMeeting: (e: React.SyntheticEvent) => void;
}

/* Card that accepts a room link or bare ID and joins it */
export default function JoinMeetingCard({ joinLink, setJoinLink, joining, joinError, joinMeeting }: Props) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-xl)",
      padding: "1.75rem",
      display: "flex", flexDirection: "column", gap: "1rem",
    }}>
      <div>
        <div style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.05rem", color: "var(--text-primary)", marginBottom: "0.3rem" }}>
          Join a meeting
        </div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: 300 }}>
          Paste a room link or ID below.
        </div>
      </div>

      <form onSubmit={joinMeeting} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <input
          type="text"
          value={joinLink}
          onChange={(e) => { setJoinLink(e.target.value); }}
          placeholder="https://… or abc-def-ghi"
          style={{
            background: "var(--bg-elevated)",
            border: `1px solid ${joinError ? "rgba(239,68,68,0.4)" : "var(--border-default)"}`,
            borderRadius: "var(--radius-md)",
            padding: "0.65rem 0.875rem",
            color: "var(--text-primary)",
            fontFamily: "var(--font-sans)", fontSize: "0.82rem",
            outline: "none", transition: "border-color 0.2s",
            width: "100%", boxSizing: "border-box",
          }}
          onFocus={(e) => { if (!joinError) e.target.style.borderColor = "var(--accent)"; }}
          onBlur={(e) => { if (!joinError) e.target.style.borderColor = "var(--border-default)"; }}
        />

        {joinError && (
          <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--red)" }}>{joinError}</div>
        )}

        <button
          type="submit"
          disabled={joining || !joinLink.trim()}
          style={{
            background: joining ? "var(--bg-elevated)" : "var(--bg-overlay)",
            color: joining || !joinLink.trim() ? "var(--text-muted)" : "var(--text-primary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            padding: "0.65rem 1.25rem",
            fontFamily: "var(--font-sans)", fontSize: "0.875rem", fontWeight: 600,
            cursor: joining || !joinLink.trim() ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { if (!joining && joinLink.trim()) e.currentTarget.style.borderColor = "rgba(34,197,94,0.4)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-default)"; }}
        >
          {joining ? (
            <>
              <span style={{ width: 12, height: 12, border: "2px solid var(--border-default)", borderTopColor: "var(--text-secondary)", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
              Joining…
            </>
          ) : (
            <>
              Join meeting <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
