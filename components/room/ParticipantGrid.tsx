import type { TrackReferenceOrPlaceholder } from "@livekit/components-core";
import type { LocalParticipant, RemoteParticipant } from "livekit-client";
import ParticipantTile from "./ParticipantTile";

interface Props {
  localParticipant: LocalParticipant;
  remoteParticipants: RemoteParticipant[];
  displayName: string;
  isHost: boolean;
  isCameraEnabled: boolean;
  tracks: TrackReferenceOrPlaceholder[];
}

/* Responsive grid of all call participants */
export default function ParticipantGrid({ localParticipant, remoteParticipants, displayName, isHost, isCameraEnabled, tracks }: Props) {
  const allParticipants = [localParticipant, ...remoteParticipants];

  return (
    <div className="room-participant-grid" style={{
      gridTemplateColumns: allParticipants.length === 1 ? "1fr" : "1fr 1fr",
      gridTemplateRows: allParticipants.length <= 2 ? "1fr" : "1fr 1fr",
    }}>
      {allParticipants.map((participant, i) => (
        <ParticipantTile
          key={participant.identity}
          participant={participant}
          isSelf={participant.identity === localParticipant.identity}
          displayName={displayName}
          isHost={isHost}
          isCameraEnabled={isCameraEnabled}
          tracks={tracks}
          colorIndex={i}
        />
      ))}
    </div>
  );
}
