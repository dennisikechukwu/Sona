import { useState } from "react";
import { useLocalParticipant } from "@livekit/components-react";

const EMOJIS = ["👍", "❤️", "👏", "😂", "😮"];

interface Props {
  onClose: () => void;
}

export default function ReactionToolbar({ onClose }: Props) {
  const { localParticipant } = useLocalParticipant();
  const [activeReaction, setActiveReaction] = useState<string | null>(null);

  const sendReaction = async (emoji: string) => {
    setActiveReaction(emoji);
    
    // Broadcast reaction via LiveKit Data Channel
    if (localParticipant) {
      const payload = JSON.stringify({ type: "reaction", emoji });
      const encoder = new TextEncoder();
      await localParticipant.publishData(encoder.encode(payload), { reliable: true });
    }

    // Trigger local animation immediately
    window.dispatchEvent(new CustomEvent("local_reaction", { detail: { emoji } }));

    setTimeout(() => {
      setActiveReaction(null);
    }, 150);
  };

  return (
    <div style={{
      display: "flex",
      gap: "0.5rem",
      background: "rgba(10, 11, 15, 0.65)",
      backdropFilter: "blur(12px)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-full)",
      padding: "0.4rem 0.6rem",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    }}>
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => sendReaction(emoji)}
          style={{
            background: activeReaction === emoji ? "var(--bg-elevated)" : "transparent",
            border: "none",
            fontSize: "1.2rem",
            padding: "0.4rem",
            borderRadius: "50%",
            cursor: "pointer",
            transition: "transform 0.15s, background 0.15s",
            transform: activeReaction === emoji ? "scale(1.2)" : "scale(1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
          onMouseLeave={(e) => {
            if (activeReaction !== emoji) {
              e.currentTarget.style.transform = "scale(1)";
            }
          }}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
