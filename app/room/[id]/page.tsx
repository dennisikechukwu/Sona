"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LiveKitRoom,
  useLocalParticipant,
  useRemoteParticipants,
  useTracks,
  RoomAudioRenderer,
  useRoomContext,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track, RoomEvent } from "livekit-client";
import { createClient } from "@/lib/supabase/client";
import type { TranscriptLine } from "@/lib/types";

// Import components
import RoomTopBar from "@/components/room/RoomTopBar";
import RoomToolbar from "@/components/room/RoomToolbar";
import ParticipantGrid from "@/components/room/ParticipantGrid";
import AISidebar from "@/components/room/AISidebar";
import EndCallModal from "@/components/room/EndCallModal";
import PostCallScreen from "@/components/room/PostCallScreen";
import SonaLogo from "@/components/shared/SonaLogo";
import ResponsiveStyles from "@/components/shared/ResponsiveStyles";

type Tab = "transcript" | "summary" | "tasks";
interface TaskItem { text: string; owner: string; due: string; done: boolean; }

// ─── Token fetcher ────────────────────────────────────────────────────────────

function useToken(roomId: string) {
  const [token, setToken] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("You");
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/livekit/token?room=${encodeURIComponent(roomId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setToken(data.token);
        setDisplayName(data.name);
        setIsHost(data.isHost ?? false);
      })
      .catch(() => setError("Failed to connect"));
  }, [roomId]);

  return { token, displayName, isHost, error };
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = use(params);
  const { token, displayName, isHost, error } = useToken(roomId);
  const router = useRouter();

  const [mediaSupported, setMediaSupported] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function") {
      setMediaSupported(true);
    }
  }, []);

  if (error) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-base)", flexDirection: "column", gap: "1rem" }}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", color: "var(--red)" }}>Connection failed</div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--text-muted)" }}>{error}</div>
        <button onClick={() => router.push("/dashboard")} style={{ background: "var(--accent)", color: "#000", border: "none", borderRadius: "var(--radius-md)", padding: "0.6rem 1.25rem", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>Go to dashboard</button>
      </div>
    );
  }

  if (!token) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-base)", flexDirection: "column", gap: "0.75rem" }}>
        <SonaLogo size={36} />
        <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--text-muted)" }}>Connecting to room…</div>
      </div>
    );
  }

  return (
    <>
      <ResponsiveStyles />
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        connect
        audio={mediaSupported}
        video={mediaSupported}
      >
        <RoomContent roomId={roomId} displayName={displayName} isHost={isHost} />
      </LiveKitRoom>
    </>
  );
}

// ─── Room content ─────────────────────────────────────────────────────────────

function RoomContent({ roomId, displayName, isHost }: { roomId: string; displayName: string; isHost: boolean }) {
  const router = useRouter();
  const room = useRoomContext();
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare], { onlySubscribed: false });

  const [activeTab, setActiveTab] = useState<Tab>("transcript");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copyDone, setCopyDone] = useState(false);
  const [time, setTime] = useState(0);
  const [liveLines, setLiveLines] = useState<TranscriptLine[]>([]);
  const [typing, setTyping] = useState(false);
  const [summary, setSummary] = useState("");
  const [keyTopics, setKeyTopics] = useState<string[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  // End-call states
  const [showEndModal, setShowEndModal] = useState(false);  // host popup
  const [ending, setEnding] = useState(false);              // processing
  const [callEnded, setCallEnded] = useState(false);        // post-call screen

  const transcriptRef = useRef<HTMLDivElement>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const activeRecorderRef = useRef<MediaRecorder | null>(null);
  const stoppedRef = useRef(false);
  const timeRef = useRef(0);
  const callEndedRef = useRef(false);

  // ── Handle Disconnects Gracefully ──────────────────────────────────────────
  useEffect(() => {
    function onDisconnect() {
      if (!callEndedRef.current) router.push("/dashboard");
    }
    room.on(RoomEvent.Disconnected, onDisconnect);
    return () => { room.off(RoomEvent.Disconnected, onDisconnect); };
  }, [room, router]);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => {
      timeRef.current += 1;
      setTime((s) => s + 1);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // ── Auto-close sidebar on mobile devices ───────────────────────────────────
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  // ── Register meeting in Supabase when room is joined ───────────────────────
  useEffect(() => {
    if (!localParticipant.identity) return;
    const supabase = createClient();
    supabase.from("meetings").upsert(
      { room_id: roomId, host_id: localParticipant.identity, started_at: new Date().toISOString() },
      { onConflict: "room_id" }
    ).then(() => {});
  }, [roomId, localParticipant.identity]);

  // ── Data channel: receive transcript lines + room_ended signal ─────────────
  useEffect(() => {
    function handleData(payload: Uint8Array) {
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload));
        if (msg.type === "transcript" && msg.line) {
          setLiveLines((prev) => [...prev, msg.line]);
        }
        if (msg.type === "room_ended") {
          // Host ended the room — participant leaves gracefully
          stopAudio();
          room.disconnect();
        }
      } catch {}
    }
    room.on(RoomEvent.DataReceived, handleData);
    return () => { room.off(RoomEvent.DataReceived, handleData); };
  }, [room]);

  // ── Stop audio helper ──────────────────────────────────────────────────────
  function stopAudio() {
    stoppedRef.current = true;
    activeRecorderRef.current?.stop();
    audioStreamRef.current?.getTracks().forEach((t) => t.stop());
  }

  // ── Send blob to Groq ──────────────────────────────────────────────────────
  const sendToGroq = useCallback(async (blob: Blob) => {
    if (blob.size < 2000) return;
    const fd = new FormData();
    fd.append("audio", blob, "audio.webm");
    setTyping(true);
    try {
      const res = await fetch("/api/transcribe", { method: "POST", body: fd });
      const data = await res.json();
      if (data.text?.trim()) {
        const now = timeRef.current;
        const m = Math.floor(now / 60);
        const s = now % 60;
        const line: TranscriptLine = {
          speaker: displayName,
          time: `${m}:${s.toString().padStart(2, "0")}`,
          text: data.text.trim(),
        };
        setLiveLines((prev) => [...prev, line]);
        const encoded = new TextEncoder().encode(JSON.stringify({ type: "transcript", line }));
        if (room.state === "connected") {
          room.localParticipant.publishData(encoded, { reliable: true });
        }
      }
    } catch {}
    setTyping(false);
  }, [displayName, room]);

  // ── Audio capture — stop/restart every 20s ─────────────────────────────────
  const startSegment = useCallback((stream: MediaStream) => {
    if (stoppedRef.current) return;
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";
    const recorder = new MediaRecorder(stream, { mimeType });
    activeRecorderRef.current = recorder;
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      if (chunks.length > 0) sendToGroq(new Blob(chunks, { type: mimeType }));
      if (!stoppedRef.current) startSegment(stream);
    };
    recorder.start();
    setTimeout(() => { if (recorder.state === "recording") recorder.stop(); }, 20000);
  }, [sendToGroq]);

  useEffect(() => {
    stoppedRef.current = false;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn("Media devices API not available. Please ensure you are using HTTPS or localhost.");
      return;
    }
    navigator.mediaDevices.getUserMedia({ 
      audio: { 
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      } 
    }).then((stream) => {
      audioStreamRef.current = stream;
      startSegment(stream);
    }).catch((err) => console.error("Mic access failed:", err));
    return () => {
      stoppedRef.current = true;
      activeRecorderRef.current?.stop();
      audioStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [startSegment]);

  // ── Auto-scroll transcript ─────────────────────────────────────────────────
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [liveLines, typing]);

  // ── End for ALL (host) ─────────────────────────────────────────────────────
  async function endForAll() {
    setShowEndModal(false);
    setEnding(true);
    stopAudio();

    // Signal all participants to disconnect
    const signal = new TextEncoder().encode(JSON.stringify({ type: "room_ended" }));
    if (room.state === "connected") {
      room.localParticipant.publishData(signal, { reliable: true });
    }

    // Save + generate summary
    if (liveLines.length > 0) {
      try {
        const res = await fetch("/api/meeting/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId,
            lines: liveLines,
            durationSeconds: timeRef.current,
            participantCount: remoteParticipants.length + 1,
            participantIds: [localParticipant.identity, ...remoteParticipants.map((p) => p.identity)].filter(Boolean),
          }),
        });
        const data = await res.json();
        if (data.summary) setSummary(data.summary);
        if (data.keyTopics) setKeyTopics(data.keyTopics);
        if (data.actionItems) setTasks(data.actionItems);
      } catch {}
    }

    // Show post-call summary screen instead of immediately redirecting
    setEnding(false);
    callEndedRef.current = true;
    setCallEnded(true);
    room.disconnect();
  }

  // ── End for ME (host leaves, room stays) ──────────────────────────────────
  function endForMe() {
    setShowEndModal(false);
    stopAudio();
    room.disconnect();
    // onDisconnected → router.push("/dashboard")
  }

  // ── Leave (participant) ────────────────────────────────────────────────────
  function leaveCall() {
    stopAudio();
    room.disconnect();
  }

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 2000);
  };

  // ── Post-call summary screen ───────────────────────────────────────────────
  if (callEnded) {
    return (
      <PostCallScreen
        totalSeconds={timeRef.current}
        liveLines={liveLines}
        summary={summary}
        keyTopics={keyTopics}
        tasks={tasks}
        onDashboard={() => router.push("/dashboard")}
        onProfile={() => router.push("/profile")}
      />
    );
  }

  // ── Main room UI ───────────────────────────────────────────────────────────
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-base)", overflow: "hidden" }}>
      <RoomAudioRenderer />

      {/* End-call confirmation modal (host only) */}
      {showEndModal && (
        <EndCallModal 
          onEndForAll={endForAll} 
          onEndForMe={endForMe} 
          onClose={() => setShowEndModal(false)}
        />
      )}

      {/* Top bar */}
      <RoomTopBar
        roomId={roomId}
        time={time}
        sidebarOpen={sidebarOpen}
        copyDone={copyDone}
        setSidebarOpen={setSidebarOpen}
        copyRoomLink={copyRoomLink}
      />

      {/* Main */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {/* Video area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

          <ParticipantGrid
            localParticipant={localParticipant}
            remoteParticipants={remoteParticipants}
            displayName={displayName}
            isHost={isHost}
            isCameraEnabled={isCameraEnabled}
            tracks={tracks}
          />

          <RoomToolbar
            isMicrophoneEnabled={isMicrophoneEnabled}
            isCameraEnabled={isCameraEnabled}
            isHost={isHost}
            ending={ending}
            localParticipant={localParticipant}
            onEndCall={() => !ending && setShowEndModal(true)}
            onLeave={leaveCall}
          />
        </div>

        {/* AI Sidebar */}
        {sidebarOpen && (
          <AISidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            transcriptRef={transcriptRef}
            liveLines={liveLines}
            typing={typing}
            setSidebarOpen={setSidebarOpen}
          />
        )}
      </div>
    </div>
  );
}
