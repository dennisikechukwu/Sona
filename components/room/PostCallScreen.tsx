"use client";

import { useState, useEffect, useCallback } from "react";
import type { TranscriptLine } from "@/lib/types";
import { Check, Sparkles } from "lucide-react";

interface TaskItem { text: string; owner: string; due: string; done: boolean; }

interface Props {
  roomId: string;
  totalSeconds: number;
  liveLines: TranscriptLine[];
  onDashboard: () => void;
  onProfile: () => void;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/* ── Shimmer skeleton line ─────────────────────────────────────────────────── */
function Skeleton({ width = "100%", height = 14, style }: { width?: string | number; height?: number; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 6,
        background: "linear-gradient(90deg, var(--bg-elevated) 25%, rgba(255,255,255,0.04) 50%, var(--bg-elevated) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.8s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

/* ── Full-screen post-call screen ──────────────────────────────────────────── */
export default function PostCallScreen({ roomId, totalSeconds, liveLines, onDashboard, onProfile }: Props) {
  const [summary, setSummary] = useState("");
  const [keyTopics, setKeyTopics] = useState<string[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [ready, setReady] = useState(false);

  // Poll for AI summary every 2 seconds until it arrives
  const pollSummary = useCallback(async () => {
    try {
      const res = await fetch(`/api/meeting/summary?roomId=${encodeURIComponent(roomId)}`);
      const data = await res.json();
      if (data.ready) {
        setSummary(data.summary || "");
        setKeyTopics(data.keyTopics || []);
        setTasks(data.actionItems || []);
        setReady(true);
        return true;
      }
    } catch { }
    return false;
  }, [roomId]);

  useEffect(() => {
    if (!liveLines.length) return;
    let stopped = false;
    const poll = async () => {
      while (!stopped) {
        const done = await pollSummary();
        if (done || stopped) break;
        await new Promise((r) => setTimeout(r, 2000));
      }
    };
    poll();
    const timeout = setTimeout(() => { stopped = true; }, 60000);
    return () => { stopped = true; clearTimeout(timeout); };
  }, [pollSummary, liveLines.length]);

  const hasTranscript = liveLines.length > 0;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      {/* Shimmer + Sona spinner keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes contentIn {
          from { opacity: 0; filter: blur(4px); transform: translateY(4px); }
          to   { opacity: 1; filter: blur(0);  transform: translateY(0); }
        }
        @keyframes sonarPulse1 {
          0%, 100% { transform: scale(1); opacity: 0.12; }
          50%      { transform: scale(1.15); opacity: 0.2; }
        }
        @keyframes sonarPulse2 {
          0%, 100% { transform: scale(1); opacity: 0.22; }
          50%      { transform: scale(1.1); opacity: 0.35; }
        }
        @keyframes sonarPulse3 {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50%      { transform: scale(1.08); opacity: 0.7; }
        }
        @keyframes sonarGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
          50%      { box-shadow: 0 0 16px 4px rgba(34,197,94,0.15); }
        }
        @keyframes checkPop {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div style={{ width: "100%", maxWidth: 560, animation: "fadeIn 0.4s ease" }}>

        {/* ── Header with Sona spinner ──────────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          {/* Sona sonar spinner / checkmark */}
          <div style={{ width: 72, height: 72, margin: "0 auto 1.15rem", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {!ready && hasTranscript ? (
              /* Sonar rings pulsing outward */
              <svg width={72} height={72} viewBox="0 0 72 72" fill="none" style={{ animation: "sonarGlow 2s ease-in-out infinite", borderRadius: "50%" }}>
                <circle cx="36" cy="36" r="34" fill="var(--accent)" opacity="0.12" style={{ animation: "sonarPulse1 2s ease-in-out infinite", transformOrigin: "center" }} />
                <circle cx="36" cy="36" r="24" fill="var(--accent)" opacity="0.22" style={{ animation: "sonarPulse2 2s ease-in-out 0.2s infinite", transformOrigin: "center" }} />
                <circle cx="36" cy="36" r="14" fill="var(--accent)" opacity="0.5" style={{ animation: "sonarPulse3 2s ease-in-out 0.4s infinite", transformOrigin: "center" }} />
                <circle cx="36" cy="36" r="6" fill="var(--accent)" />
              </svg>
            ) : (
              /* Checkmark — pops in when ready */
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--accent-dim)", border: "2px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", animation: ready ? "checkPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none" }}>
                <Check size={28} color="var(--accent)" />
              </div>
            )}
          </div>

          <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 900, fontSize: "1.6rem", color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "0.35rem" }}>
            {!ready && hasTranscript ? "Processing meeting…" : "Meeting ended"}
          </h1>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Duration: {formatTime(totalSeconds)} · {liveLines.length} transcript lines
          </p>
        </div>

        {/* ── AI Summary card (always present — skeleton or real) ────────── */}
        {hasTranscript && (
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-xl)", padding: "1.5rem", marginBottom: "1rem", transition: "border-color 0.4s", ...(ready ? { borderColor: "rgba(34,197,94,0.2)" } : {}) }}>
            {/* Label row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Sparkles size={14} color="var(--accent)" />
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>AI Summary</span>
              </div>
              {!ready && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: "pulse 1.5s ease-in-out infinite" }} />
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", color: "var(--text-muted)" }}>Generating…</span>
                </div>
              )}
            </div>

            {/* Content: skeleton → real */}
            {ready ? (
              <div style={{ animation: "contentIn 0.5s ease" }}>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.75, fontWeight: 300, margin: 0 }}>{summary}</p>
                {keyTopics.length > 0 && (
                  <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {keyTopics.map((t, i) => (
                      <span key={i} style={{ background: "var(--accent-dim)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "var(--radius-full)", padding: "3px 10px", fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--accent)" }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <Skeleton width="100%" height={13} />
                <Skeleton width="92%" height={13} style={{ marginTop: 10 }} />
                <Skeleton width="78%" height={13} style={{ marginTop: 10 }} />
                <div style={{ marginTop: 16, display: "flex", gap: 6 }}>
                  <Skeleton width={72} height={22} />
                  <Skeleton width={88} height={22} />
                  <Skeleton width={64} height={22} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Action items card ─────────────────────────────────────────── */}
        {hasTranscript && (
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-xl)", padding: "1.5rem", marginBottom: "1rem", transition: "border-color 0.4s", ...(ready ? { borderColor: "rgba(34,197,94,0.2)" } : {}) }}>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Action Items</div>

            {ready ? (
              tasks.length > 0 ? (
                <div style={{ animation: "contentIn 0.5s ease" }}>
                  {tasks.map((task, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "0.6rem 0", borderBottom: i < tasks.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                      <div style={{ width: 16, height: 16, borderRadius: 4, border: "1.5px solid var(--border-strong)", flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--text-primary)" }}>{task.text}</div>
                        {(task.owner || task.due) && (
                          <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 2 }}>
                            {task.owner && <span style={{ color: "var(--accent)", marginRight: 8 }}>{task.owner}</span>}
                            {task.due && `Due: ${task.due}`}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ animation: "contentIn 0.5s ease", fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  No action items were detected.
                </div>
              )
            ) : (
              <div>
                <div style={{ display: "flex", gap: 10, padding: "0.6rem 0" }}>
                  <Skeleton width={16} height={16} />
                  <div style={{ flex: 1 }}>
                    <Skeleton width="85%" height={13} />
                    <Skeleton width="40%" height={10} style={{ marginTop: 6 }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, padding: "0.6rem 0" }}>
                  <Skeleton width={16} height={16} />
                  <div style={{ flex: 1 }}>
                    <Skeleton width="70%" height={13} />
                    <Skeleton width="35%" height={10} style={{ marginTop: 6 }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* No transcript fallback */}
        {!hasTranscript && (
          <div style={{ background: "var(--bg-surface)", border: "1px dashed var(--border-default)", borderRadius: "var(--radius-xl)", padding: "2rem", textAlign: "center", marginBottom: "1rem" }}>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              No transcript was captured during this session.
            </div>
          </div>
        )}

        {/* Transcript saved confirmation */}
        {hasTranscript && (
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-xl)", padding: "1.25rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 10 }}>
            <Check size={16} color="var(--accent)" />
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              Transcript saved ({liveLines.length} lines) · Email summary {ready ? "sent" : "sending…"}
            </span>
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
          <button
            onClick={onDashboard}
            style={{ flex: 1, background: "var(--accent)", color: "#000", border: "none", borderRadius: "var(--radius-md)", padding: "0.875rem", fontFamily: "var(--font-sans)", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", transition: "opacity 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Go to dashboard
          </button>
          <button
            onClick={onProfile}
            style={{ flex: 1, background: "var(--bg-surface)", color: "var(--text-secondary)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "0.875rem", fontFamily: "var(--font-sans)", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", transition: "border-color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(34,197,94,0.4)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
          >
            View in profile
          </button>
        </div>
      </div>
    </div>
  );
}
