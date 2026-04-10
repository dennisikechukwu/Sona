import SonaLogo from "@/components/shared/SonaLogo";
import { IconVideo, IconMenu, IconX } from "./landing-icons";

import { useEffect, useRef } from "react";

interface Props {
  menuOpen: boolean;
  setMenuOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  startMeeting: () => void;
}

const NAV_LINKS = [
  ["Features", "#features"],
  ["How it works", "#how"],
  ["Pricing", "#pricing"],
] as const;

/* Top navigation bar — desktop links + mobile hamburger (Updated) */
export default function LandingNav({ menuOpen, setMenuOpen, startMeeting }: Props) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuOpen && navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen, setMenuOpen]);

  return (
    <nav ref={navRef} style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(10,11,15,0.92)", backdropFilter: "blur(16px)",
      borderBottom: "1px solid var(--border-subtle)",
    }}>
      <div className="nav-inner">
        {/* Logo */}
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <SonaLogo size={26} />
          <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Sona</span>
        </a>

        {/* Desktop links */}
        <div className="nav-links">
          {NAV_LINKS.map(([label, href]) => (
            <a key={label} href={href}
              style={{ color: "var(--text-secondary)", fontSize: "0.875rem", textDecoration: "none", fontFamily: "var(--font-sans)", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            >{label}</a>
          ))}
        </div>

        {/* Right side: CTA + hamburger */}
        <div className="nav-cta" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            className="nav-cta-start"
            onClick={startMeeting}
            style={{ background: "var(--accent)", color: "#000", border: "none", borderRadius: "var(--radius-full)", padding: "0.5rem 1.25rem", fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-sans)", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, transition: "transform 0.15s, box-shadow 0.15s", whiteSpace: "nowrap" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(34,197,94,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <IconVideo />Start meeting
          </button>

          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            style={{ background: "none", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", cursor: "pointer", padding: "6px 8px" }}
          >
            {menuOpen ? <IconX /> : <IconMenu />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div className={`mobile-menu${menuOpen ? "" : " closed"}`}>
        {NAV_LINKS.map(([label, href]) => (
          <a key={label} href={href} className="mobile-menu-link" onClick={() => setMenuOpen(false)}>{label}</a>
        ))}
        <button className="mobile-menu-btn" onClick={() => { setMenuOpen(false); startMeeting(); }}>
          Start a meeting — it&apos;s free
        </button>
      </div>
    </nav>
  );
}
