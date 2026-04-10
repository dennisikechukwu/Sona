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
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    window.location.href = user ? `/room/${genRoom()}` : "/auth";
  };

  const joinRoom = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const id = roomCode.trim().toLowerCase();
    window.location.href = user ? `/room/${id}` : `/auth?next=/room/${id}`;
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
