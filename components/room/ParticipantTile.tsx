import { VideoTrack } from "@livekit/components-react";
import type { TrackReferenceOrPlaceholder, TrackReference } from "@livekit/components-core";
import type { Participant } from "livekit-client";
import { Track } from "livekit-client";

interface Props {
  participant: Participant;
  isSelf: boolean;
  displayName: string;
  isHost: boolean;
  isCameraEnabled: boolean;
  tracks: TrackReferenceOrPlaceholder[];
  colorIndex: number;
}

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"];

/* Single participant tile — shows video or avatar fallback */
export default function ParticipantTile({ participant, isSelf, displayName, isHost, isCameraEnabled, tracks, colorIndex }: Props) {
  const color = COLORS[colorIndex % COLORS.length];
  const name = isSelf ? displayName : (participant.name || participant.identity);
  const initials = name.slice(0, 2).toUpperCase();

  const camTrack = tracks.find(
    (t) => t.participant.identity === participant.identity && t.source === Track.Source.Camera
  );
  const showVideo = isSelf
    ? isCameraEnabled && !!camTrack
    : !!camTrack && !camTrack.publication?.isMuted;

  return (
    <div style={{
      background: "var(--bg-elevated)",
      border: `1px solid ${participant.isSpeaking ? `${color}55` : "var(--border-subtle)"}`,
      borderRadius: "var(--radius-lg)",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
      minHeight: 120,
      boxShadow: participant.isSpeaking ? `0 0 0 2px ${color}33` : "none",
      transition: "box-shadow 0.3s, border-color 0.3s",
    }}>
      {/* Video or avatar */}
      {showVideo && camTrack && camTrack.publication ? (
        <VideoTrack trackRef={camTrack as TrackReference} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: `${color}22`, border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.1rem", color }}>
            {initials}
          </div>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "var(--text-muted)" }}>Camera off</span>
        </div>
      )}

      {/* Speaking waveform */}
      {participant.isSpeaking && (
        <div style={{ position: "absolute", bottom: 42, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 2, alignItems: "center" }}>
          {[0.5, 0.9, 0.6, 1, 0.7, 0.85, 0.5].map((h, j) => (
            <div key={j} style={{ width: 3, height: `${h * 16}px`, background: color, borderRadius: 2, opacity: 0.8, animation: `waveform ${0.35 + j * 0.08}s ease-in-out infinite alternate`, animationDelay: `${j * 0.04}s` }} />
          ))}
        </div>
      )}

      {/* Name tag */}
      <div style={{ position: "absolute", bottom: 10, left: 10 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(10,11,15,0.85)", backdropFilter: "blur(8px)", border: `1px solid ${participant.isSpeaking ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)"}`, borderRadius: "var(--radius-full)", padding: "3px 10px 3px 6px" }}>
          {participant.isSpeaking && (
            <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
              {[0.6, 1, 0.7].map((h, j) => (
                <div key={j} style={{ width: 2, height: `${h * 10}px`, background: "var(--accent)", borderRadius: 1, animation: `waveform ${0.3 + j * 0.1}s ease-in-out infinite alternate` }} />
              ))}
            </div>
          )}
          {!isSelf && participant.audioLevel === 0 && <span style={{ fontSize: "0.6rem" }}>🔇</span>}
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "var(--text-primary)", fontWeight: 400 }}>
            {name}{isSelf ? " (You)" : ""}
            {isSelf && isHost && <span style={{ marginLeft: 4, fontSize: "0.6rem", color, opacity: 0.7 }}>Host</span>}
          </span>
        </div>
      </div>
    </div>
  );
}
