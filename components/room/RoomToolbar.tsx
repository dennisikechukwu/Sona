import type { LocalParticipant } from "livekit-client";
import { useState } from "react";
import { Mic, MicOff, Video, VideoOff, Smile, Presentation } from "lucide-react";
import ToolbarBtn from "./ToolbarBtn";
import ReactionToolbar from "./ReactionToolbar";

interface Props {
  isMicrophoneEnabled: boolean;
  isCameraEnabled: boolean;
  isHost: boolean;
  boardOpen: boolean;
  localParticipant: LocalParticipant;
  onEndCall: () => void;   // opens host modal
  onLeave: () => void;     // participant leave
  onToggleBoard: () => void;
}

/* Bottom toolbar with mic, camera, board, reactions, and end/leave button */
export default function RoomToolbar({ isMicrophoneEnabled, isCameraEnabled, isHost, boardOpen, localParticipant, onEndCall, onLeave, onToggleBoard }: Props) {
  const [showReactions, setShowReactions] = useState(false);

  const checkMedia = () => {
    if (typeof navigator !== "undefined" && (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function")) {
      alert("Hardware media access is restricted on unsecured networks (HTTPS or localhost is required).");
      return false;
    }
    return true;
  };

  return (
    <div className="room-toolbar-inner">
      {/* Mic toggle */}
      <ToolbarBtn
        label={isMicrophoneEnabled ? "Mute" : "Unmute"}
        icon={isMicrophoneEnabled ? <Mic size={20} strokeWidth={2.5} /> : <MicOff size={20} strokeWidth={2.5} />}
        danger={!isMicrophoneEnabled}
        onClick={() => { if (checkMedia()) localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled); }}
      />

      {/* Camera toggle */}
      <ToolbarBtn
        label={isCameraEnabled ? "Stop video" : "Start video"}
        icon={isCameraEnabled ? <Video size={20} strokeWidth={2.5} /> : <VideoOff size={20} strokeWidth={2.5} />}
        danger={!isCameraEnabled}
        onClick={() => { if (checkMedia()) localParticipant.setCameraEnabled(!isCameraEnabled); }}
      />

      {/* Board toggle (all participants) */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <button
          onClick={onToggleBoard}
          title={boardOpen ? "Close board" : "Open board"}
          style={{
            width: 44, height: 44,
            borderRadius: "var(--radius-md)",
            border: boardOpen ? "1px solid rgba(34,197,94,0.35)" : "1px solid var(--border-default)",
            background: boardOpen ? "var(--accent-dim)" : "var(--bg-elevated)",
            color: boardOpen ? "var(--accent)" : "var(--text-primary)",
            fontSize: "1.1rem",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s, transform 0.1s, border-color 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <Presentation size={20} strokeWidth={2.5} />
        </button>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.6rem", color: boardOpen ? "var(--accent)" : "var(--text-muted)", whiteSpace: "nowrap" }}>Board</span>
      </div>

      {/* Reactions toggle */}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {showReactions && (
          <div style={{ position: "absolute", bottom: "calc(100% + 15px)", left: "50%", transform: "translateX(-50%)", zIndex: 50 }}>
            <ReactionToolbar onClose={() => setShowReactions(false)} />
          </div>
        )}
        <ToolbarBtn
          label="Reactions"
          icon={<Smile size={20} strokeWidth={2.5} />}
          onClick={() => setShowReactions((prev) => !prev)}
        />
      </div>

      <div style={{ width: 1, height: 32, background: "var(--border-subtle)", margin: "0 6px" }} />

      {isHost ? (
        /* Host: opens end-call modal */
        <button
          onClick={onEndCall}
          style={{ background: "var(--red)", border: "none", borderRadius: "var(--radius-full)", padding: "10px 24px", color: "#fff", fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-sans)", cursor: "pointer", transition: "opacity 0.2s", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          End call
        </button>
      ) : (
        /* Participant: leave */
        <button
          onClick={onLeave}
          style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "var(--radius-full)", padding: "10px 24px", color: "var(--red)", fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-sans)", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.25)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; }}
        >
          Leave
        </button>
      )}
    </div>
  );
}

