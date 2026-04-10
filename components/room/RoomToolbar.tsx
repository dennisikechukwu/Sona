import type { LocalParticipant } from "livekit-client";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import ToolbarBtn from "./ToolbarBtn";

interface Props {
  isMicrophoneEnabled: boolean;
  isCameraEnabled: boolean;
  isHost: boolean;
  ending: boolean;
  localParticipant: LocalParticipant;
  onEndCall: () => void;   // opens host modal
  onLeave: () => void;     // participant leave
}

/* Bottom toolbar with mic, camera, screen-share, and end/leave button */
export default function RoomToolbar({ isMicrophoneEnabled, isCameraEnabled, isHost, ending, localParticipant, onEndCall, onLeave }: Props) {
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



      <div style={{ width: 1, height: 32, background: "var(--border-subtle)", margin: "0 6px" }} />

      {isHost ? (
        /* Host: opens end-call modal */
        <button
          onClick={() => !ending && onEndCall()}
          disabled={ending}
          style={{ background: "var(--red)", border: "none", borderRadius: "var(--radius-full)", padding: "10px 24px", color: "#fff", fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-sans)", cursor: ending ? "not-allowed" : "pointer", opacity: ending ? 0.7 : 1, transition: "opacity 0.2s", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}
          onMouseEnter={(e) => { if (!ending) e.currentTarget.style.opacity = "0.85"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = ending ? "0.7" : "1"; }}
        >
          {ending ? (
            <>
              <span style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
              Ending…
            </>
          ) : "End call"}
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
