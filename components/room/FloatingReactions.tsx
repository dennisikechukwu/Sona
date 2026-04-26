import { useEffect, useState } from "react";
import { useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";

interface Reaction {
  id: string;
  emoji: string;
  x: number;
}

export default function FloatingReactions() {
  const room = useRoomContext();
  const [reactions, setReactions] = useState<Reaction[]>([]);

  useEffect(() => {
    const handleDataReceived = (payload: Uint8Array, participant: any, kind: any, topic?: string) => {
      try {
        const decoder = new TextDecoder();
        const data = JSON.parse(decoder.decode(payload));
        
        if (data.type === "reaction" && data.emoji) {
          spawnReaction(data.emoji);
        }
      } catch (err) {
        // Ignore parse errors (might be non-JSON data channel messages)
      }
    };

    const handleLocalReaction = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.emoji) {
        spawnReaction(customEvent.detail.emoji);
      }
    };

    const spawnReaction = (emoji: string) => {
      const id = Math.random().toString(36).substr(2, 9);
      // Randomize horizontal position slightly (between 40% and 60% of the screen width)
      const x = 40 + Math.random() * 20;
      
      setReactions((prev) => [...prev, { id, emoji, x }]);
      
      // Remove the reaction after animation completes (2 seconds)
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== id));
      }, 2000);
    };

    room.on(RoomEvent.DataReceived, handleDataReceived);
    window.addEventListener("local_reaction", handleLocalReaction);
    
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
      window.removeEventListener("local_reaction", handleLocalReaction);
    };
  }, [room]);

  if (reactions.length === 0) return null;

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 50, overflow: "hidden" }}>
      <style>{`
        @keyframes floatUpAndFade {
          0% { transform: translateY(100px) scale(0.5); opacity: 0; }
          20% { transform: translateY(0px) scale(1.2); opacity: 1; }
          80% { transform: translateY(-100px) scale(1); opacity: 0.8; }
          100% { transform: translateY(-150px) scale(0.8); opacity: 0; }
        }
      `}</style>
      {reactions.map((r) => (
        <div
          key={r.id}
          style={{
            position: "absolute",
            bottom: "120px", // Start above the toolbar
            left: `${r.x}%`,
            fontSize: "2.5rem",
            animation: "floatUpAndFade 2s ease-out forwards",
            filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.2))"
          }}
        >
          {r.emoji}
        </div>
      ))}
    </div>
  );
}
