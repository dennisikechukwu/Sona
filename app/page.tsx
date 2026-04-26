"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

// Import landing components
import LandingStyles from "@/components/landing/LandingStyles";
import LandingNav from "@/components/landing/LandingNav";
import LandingHero from "@/components/landing/LandingHero";
import AppPreview from "@/components/landing/AppPreview";
import WhatIsSona from "@/components/landing/WhatIsSona";
import ProblemSolution from "@/components/landing/ProblemSolution";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import FinalCTA from "@/components/landing/FinalCTA";
import LandingFooter from "@/components/landing/LandingFooter";
import { transcriptLines, testimonials } from "@/components/landing/landing-data";

export default function LandingPage() {
  const [mounted,     setMounted]     = useState(false);
  const [roomCode,    setRoomCode]    = useState("");
  const [activeTesti, setActiveTesti] = useState(0);
  const [txIdx,       setTxIdx]       = useState(2);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const txRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const t1 = setInterval(() => setTxIdx(i => i < transcriptLines.length - 1 ? i + 1 : i), 3000);
    const t2 = setInterval(() => setActiveTesti(i => (i + 1) % testimonials.length), 4500);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  useEffect(() => {
    if (txRef.current) txRef.current.scrollTop = txRef.current.scrollHeight;
  }, [txIdx]);

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const genRoom = () => {
    const c = "abcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length: 9 }, (_, i) => i === 3 || i === 6 ? "-" : c[Math.floor(Math.random() * c.length)]).join("");
  };

  const startMeeting = async () => {
    // Creating rooms strictly requires authentication.
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Pre-claim room so it can't be hijacked
      const newRoomId = genRoom();
      await supabase.from("meetings").insert({
        room_id: newRoomId,
        host_id: user.id,
        started_at: new Date().toISOString(),
      });
      window.location.href = `/room/${newRoomId}`;
    } else {
      window.location.href = "/auth";
    }
  };

  const joinRoom = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    
    let roomId = roomCode.trim().toLowerCase();
    
    // In V2, Guests can join natively. The `/room/[id]` page's PreJoinLobby 
    // will intercept unauthenticated users and safely issue them a Guest token.
    try {
      const url = new URL(roomId);
      const parts = url.pathname.split("/").filter(Boolean);
      const roomIndex = parts.indexOf("room");
      if (roomIndex !== -1 && parts[roomIndex + 1]) {
        roomId = parts[roomIndex + 1];
      }
    } catch {
      // not a full URL, use raw code
    }

    window.location.href = `/room/${roomId}`;
  };

  return (
    <>
      <LandingStyles />

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <LandingNav 
          menuOpen={menuOpen} 
          setMenuOpen={setMenuOpen} 
          startMeeting={startMeeting} 
        />

        <main style={{ flex: 1 }}>
          <LandingHero 
            mounted={mounted} 
            roomCode={roomCode} 
            setRoomCode={setRoomCode} 
            joinRoom={joinRoom} 
            startMeeting={startMeeting} 
          />

          <AppPreview 
            txRef={txRef} 
            txIdx={txIdx} 
          />

          <WhatIsSona />

          <ProblemSolution />

          <Features />

          <HowItWorks />

          <Testimonials 
            activeTesti={activeTesti} 
            setActiveTesti={setActiveTesti} 
          />

          <Pricing 
            startMeeting={startMeeting} 
          />

          <FinalCTA 
            startMeeting={startMeeting} 
          />
        </main>

        <LandingFooter />
      </div>
    </>
  );
}
