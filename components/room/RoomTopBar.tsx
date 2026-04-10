import SonaLogo from "@/components/shared/SonaLogo";

interface Props {
  roomId: string;
  time: number;
  sidebarOpen: boolean;
  copyDone: boolean;
  setSidebarOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  copyRoomLink: () => void;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/* Sticky header bar shown during a live call */
export default function RoomTopBar({ roomId, time, sidebarOpen, copyDone, setSidebarOpen, copyRoomLink }: Props) {
  return (
    <div className="room-topbar-inner" style={{
      height: 56,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 1.25rem",
      borderBottom: "1px solid var(--border-subtle)",
      background: "var(--bg-surface)",
      flexShrink: 0, zIndex: 10,
    }}>
      {/* Left: logo + room ID */}
      <div className="room-topbar-left">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SonaLogo size={20} />
          <span className="room-topbar-title" style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>Sona</span>
        </div>
        <div className="room-topbar-title" style={{ width: 1, height: 20, background: "var(--border-subtle)" }} />
        <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 300 }}>
          <span className="room-param-labels">Room: </span><span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{roomId}</span>
        </div>
      </div>

      {/* Centre: status badges */}
      <div className="room-topbar-center">
        {/* Live timer */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--red-dim)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "var(--radius-full)", padding: "4px 12px" }}>
          <span style={{ width: 6, height: 6, background: "var(--red)", borderRadius: "50%", animation: "blink 1.4s infinite", display: "block" }} />
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--red)", fontWeight: 600 }}>
            <span className="room-param-labels">LIVE · </span>{formatTime(time)}
          </span>
        </div>
        {/* AI status */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--accent-dim)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "var(--radius-full)", padding: "4px 12px" }}>
          <span style={{ width: 6, height: 6, background: "var(--accent)", borderRadius: "50%", animation: "blink 1.8s infinite 0.5s", display: "block" }} />
          <span className="room-param-labels" style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--accent)", fontWeight: 600 }}>AI listening</span>
        </div>
      </div>

      {/* Right: action buttons */}
      <div className="room-topbar-right">
        <button
          onClick={copyRoomLink}
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "6px 12px", color: copyDone ? "var(--accent)" : "var(--text-secondary)", fontSize: "0.78rem", fontFamily: "var(--font-sans)", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}
        >
          {copyDone ? "✓ Copied!" : <><span className="room-param-labels">📋 Copy </span>invite</>}
        </button>
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          style={{ background: sidebarOpen ? "var(--accent-dim)" : "var(--bg-elevated)", border: `1px solid ${sidebarOpen ? "rgba(34,197,94,0.25)" : "var(--border-default)"}`, borderRadius: "var(--radius-md)", padding: "6px 12px", color: sidebarOpen ? "var(--accent)" : "var(--text-secondary)", fontSize: "0.78rem", fontFamily: "var(--font-sans)", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}
        >
          {sidebarOpen ? "Hide AI ✕" : "Show AI ✦"}
        </button>
      </div>
    </div>
  );
}
