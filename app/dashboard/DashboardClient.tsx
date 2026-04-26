"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Import components
import DashboardNav from "@/components/dashboard/DashboardNav";
import StartMeetingCard from "@/components/dashboard/StartMeetingCard";
import JoinMeetingCard from "@/components/dashboard/JoinMeetingCard";
import MeetingList from "@/components/dashboard/MeetingList";
import ResponsiveStyles from "@/components/shared/ResponsiveStyles";

type Meeting = {
  id: string;
  room_id: string;
  title: string | null;
  started_at: string;
  ended_at: string | null;
  participant_count: number;
};

type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
} | null;

interface Props {
  user: { id: string; email: string };
  profile: Profile;
  meetings: Meeting[];
}

export default function DashboardClient({ user, profile, meetings }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [starting, setStarting] = useState(false);
  const [joining, setJoining] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [joinLink, setJoinLink] = useState("");
  const [joinError, setJoinError] = useState("");

  const displayName = profile?.display_name || user.email.split("@")[0];
  const initials = displayName.slice(0, 2).toUpperCase();

  function genRoomId() {
    const c = "abcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length: 9 }, (_, i) =>
      i === 3 || i === 6 ? "-" : c[Math.floor(Math.random() * c.length)]
    ).join("");
  }

  async function startMeeting() {
    setStarting(true);
    const newRoomId = genRoomId();
    
    // Rigorously claim the room ownership in the database BEFORE navigating
    // so participants who load the link first can never hijack the host status.
    await supabase.from("meetings").insert({
      room_id: newRoomId,
      host_id: user.id,
      started_at: new Date().toISOString(),
    });

    router.push(`/room/${newRoomId}`);
  }

  function joinMeeting(e: React.SyntheticEvent) {
    e.preventDefault();
    setJoinError("");
    const raw = joinLink.trim();
    if (!raw) return;

    // Accept full URL like https://sona.app/room/abc-def-ghi or just the room ID
    let roomId = raw;
    try {
      const url = new URL(raw);
      const parts = url.pathname.split("/").filter(Boolean);
      const roomIndex = parts.indexOf("room");
      if (roomIndex !== -1 && parts[roomIndex + 1]) {
        roomId = parts[roomIndex + 1];
      }
    } catch {
      // not a URL — use as-is
    }

    if (!roomId) {
      setJoinError("Invalid meeting link or room ID.");
      return;
    }

    setJoining(true);
    router.push(`/room/${roomId}`);
  }

  async function signOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <ResponsiveStyles />
      <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>

        {/* Nav */}
        <DashboardNav 
          displayName={displayName} 
          initials={initials}
          avatarUrl={profile?.avatar_url}
          signingOut={signingOut} 
          signOut={signOut} 
        />

        <main className="dashboard-main" style={{ maxWidth: 900, margin: "0 auto", padding: "2.5rem 1.5rem" }}>

          {/* Header */}
          <div style={{ marginBottom: "2.5rem" }}>
            <h1 style={{
              fontFamily: "var(--font-serif)", fontWeight: 900,
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "0.35rem",
            }}>
              Welcome back, {displayName.split(" ")[0]} 👋
            </h1>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 300 }}>
              Start a new meeting or join one with a link.
            </p>
          </div>

          {/* Two action cards */}
          <div className="dashboard-grid">

            <StartMeetingCard 
              starting={starting} 
              startMeeting={startMeeting} 
            />

            <JoinMeetingCard 
              joinLink={joinLink} 
              setJoinLink={setJoinLink} 
              joining={joining} 
              joinError={joinError} 
              joinMeeting={joinMeeting} 
            />

          </div>

          {/* Past meetings */}
          <MeetingList meetings={meetings} />

        </main>
      </div>
    </>
  );
}
