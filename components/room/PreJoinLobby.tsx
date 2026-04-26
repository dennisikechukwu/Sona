"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff, Video as VideoIcon, VideoOff } from "lucide-react";
import SonaLogo from "@/components/shared/SonaLogo";

interface Props {
  onJoin: (name: string, micEnabled: boolean, camEnabled: boolean) => void;
  defaultName?: string;
  isHost?: boolean;
}

export default function PreJoinLobby({ onJoin, defaultName = "", isHost = false }: Props) {
  const [name, setName] = useState(defaultName);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [volumeBars, setVolumeBars] = useState<number[]>(Array(5).fill(0));

  // Initialize hardware preview
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((s) => {
          activeStream = s;
          setStream(s);
        })
        .catch((err) => {
          console.warn("Hardware access denied or unavailable", err);
          setMicEnabled(false);
          setCamEnabled(false);
        });
    }
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Poll microphone volume for visualizer
  useEffect(() => {
    let audioCtx: AudioContext | null = null;
    let analyzer: AnalyserNode | null = null;
    let rafId: number;

    if (stream && micEnabled) {
      const AudioCtxConstructor = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxConstructor) {
        audioCtx = new AudioCtxConstructor();
        analyzer = audioCtx.createAnalyser();
        analyzer.fftSize = 256;
        
        // Ensure we only pass audio tracks, some browsers throw if stream has no audio tracks
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length > 0) {
          const mStream = new MediaStream([audioTracks[0]]);
          const source = audioCtx.createMediaStreamSource(mStream);
          source.connect(analyzer);
          const dataArray = new Uint8Array(analyzer.frequencyBinCount);

          const updateVolume = () => {
            if (!analyzer) return;
            analyzer.getByteFrequencyData(dataArray);
            
            // Map frequencies to 5 bars
            const bars = [];
            for (let i = 0; i < 5; i++) {
              const val = dataArray[i * 15]; // sample low-mid frequencies
              bars.push(Math.min(val / 255, 1));
            }
            setVolumeBars(bars);
            rafId = requestAnimationFrame(updateVolume);
          };
          updateVolume();
        }
      }
    } else {
      setVolumeBars(Array(5).fill(0));
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (audioCtx && audioCtx.state !== "closed") {
        audioCtx.close().catch(console.error);
      }
    };
  }, [stream, micEnabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name.trim(), micEnabled, camEnabled);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-base)",
      padding: "1.5rem",
      fontFamily: "var(--font-sans)",
    }}>
      <div className="prejoin-lobby-grid flex flex-col lg:grid lg:grid-cols-[1fr_360px]" style={{ width: "100%", maxWidth: "920px", gap: "2.5rem", alignItems: "center" }}>
        
        {/* Left: Video Preview Window */}
        <div style={{
          background: "var(--bg-surface)",
          aspectRatio: "16/9",
          width: "100%",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
          position: "relative",
          border: "1px solid var(--border-default)",
        }}>
          {camEnabled && stream ? (
            <video
              autoPlay
              playsInline
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
              ref={(v) => { if (v && v.srcObject !== stream) v.srcObject = stream; }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
              <VideoOff size={48} strokeWidth={1} />
            </div>
          )}

          {/* Radar Audio Visualizer */}
          <div style={{ position: "absolute", bottom: "1.5rem", left: "1.5rem", display: "flex", gap: "4px", alignItems: "center", height: "30px", padding: "6px 10px", background: "rgba(0,0,0,0.5)", borderRadius: "var(--radius-full)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}>
            {volumeBars.map((vol, i) => (
              <div
                key={i}
                style={{
                  width: "4px",
                  background: micEnabled ? "var(--accent)" : "var(--text-muted)",
                  borderRadius: "2px",
                  height: micEnabled ? `${Math.max(15, vol * 100)}%` : "15%",
                  transition: "height 0.05s ease",
                  opacity: micEnabled ? (0.4 + vol * 0.6) : 0.3
                }}
              />
            ))}
          </div>

          {/* Overlay Toggles */}
          <div style={{ position: "absolute", bottom: "1.5rem", left: 0, right: 0, display: "flex", justifyContent: "center", gap: "1rem" }}>
            <button
              onClick={() => setMicEnabled(!micEnabled)}
              style={{ width: 44, height: 44, borderRadius: "50%", background: micEnabled ? "rgba(0,0,0,0.6)" : "var(--red)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(8px)" }}
            >
              {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button
              onClick={() => setCamEnabled(!camEnabled)}
              style={{ width: 44, height: 44, borderRadius: "50%", background: camEnabled ? "rgba(0,0,0,0.6)" : "var(--red)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(8px)" }}
            >
              {camEnabled ? <VideoIcon size={20} /> : <VideoOff size={20} />}
            </button>
          </div>
        </div>

        {/* Right: Join Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%", maxWidth: "480px" }}>
          <div>
            <SonaLogo size={32} />
            <h1 style={{ fontSize: "1.5rem", color: "var(--text-primary)", margin: "1rem 0 0.25rem 0", fontFamily: "var(--font-serif)" }}>
              Ready to join?
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {isHost ? "You are the host of this room." : "Enter your name to join the meeting."}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {!isHost && (
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  required
                  style={{
                    width: "100%", background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-md)", padding: "0.75rem 1rem", color: "var(--text-primary)",
                    fontSize: "0.9rem", outline: "none"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
                />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <button
                type="submit"
                disabled={!isHost && !name.trim()}
                style={{
                  background: (!isHost && !name.trim()) ? "var(--bg-elevated)" : "var(--accent)",
                  color: (!isHost && !name.trim()) ? "var(--text-muted)" : "#000",
                  border: "none", borderRadius: "var(--radius-md)", padding: "0.875rem",
                  fontSize: "0.9rem", fontWeight: 700, cursor: (!isHost && !name.trim()) ? "not-allowed" : "pointer",
                  transition: "all 0.2s"
                }}
              >
                Join meeting
              </button>

              <button
                type="button"
                onClick={() => {
                  if (stream) stream.getTracks().forEach(t => t.stop());
                  window.location.href = "/";
                }}
                style={{
                  background: "transparent",
                  color: "var(--text-muted)",
                  border: "none", borderRadius: "var(--radius-md)", padding: "0.75rem",
                  fontSize: "0.85rem", fontWeight: 500, cursor: "pointer",
                  transition: "color 0.2s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                Cancel and return home
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
