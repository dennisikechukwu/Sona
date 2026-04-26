import { Video } from "lucide-react";

interface Props {
  starting: boolean;
  startMeeting: () => void;
}

/* Card that lets the user instantly create a new meeting room */
export default function StartMeetingCard({ starting, startMeeting }: Props) {
  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.03))",
      border: "1px solid rgba(34,197,94,0.25)",
      borderRadius: "var(--radius-xl)",
      padding: "1.75rem",
      display: "flex", flexDirection: "column", gap: "1rem",
    }}>
      <div>
        <div style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.05rem", color: "var(--text-primary)", marginBottom: "0.3rem" }}>
          Start a meeting
        </div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: 300 }}>
          Create an instant room and share the link.
        </div>
      </div>

      <button
        onClick={startMeeting}
        disabled={starting}
        style={{
          background: starting ? "var(--bg-elevated)" : "var(--accent)",
          color: starting ? "var(--text-muted)" : "#000",
          border: "none",
          borderRadius: "var(--radius-md)",
          padding: "0.75rem 1.25rem",
          fontFamily: "var(--font-sans)", fontSize: "0.875rem", fontWeight: 700,
          cursor: starting ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          boxShadow: starting ? "none" : "0 0 30px rgba(34,197,94,0.25)",
          transition: "transform 0.15s, box-shadow 0.15s, background 0.2s",
        }}
        onMouseEnter={(e) => { if (!starting) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(34,197,94,0.4)"; } }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = starting ? "none" : "0 0 30px rgba(34,197,94,0.25)"; }}
      >
        {starting ? (
          <>
            <span style={{ width: 12, height: 12, border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "var(--text-muted)", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
            Starting…
          </>
        ) : (
          <>
            <Video size={16} /> Start new meeting
          </>
        )}
      </button>
    </div>
  );
}
