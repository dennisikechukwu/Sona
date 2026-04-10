import { useState, useRef, useEffect } from "react";
import SonaLogo from "@/components/shared/SonaLogo";

interface Props {
  displayName: string;
  initials: string;
  signingOut: boolean;
  signOut: () => void;
}

const IconMenu = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
const IconX = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);

/* Top navigation bar for the dashboard page */
export default function DashboardNav({ displayName, initials, signingOut, signOut }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuOpen && navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <nav ref={navRef} style={{
      borderBottom: "1px solid var(--border-subtle)",
      background: "var(--bg-surface)",
      position: "sticky", top: 0, zIndex: 10,
    }}>
      <div className="app-nav-inner">
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SonaLogo size={24} />
          <span style={{ fontFamily: "var(--font-serif)", fontWeight: 900, fontSize: "1.05rem", color: "var(--text-primary)" }}>Sona</span>
        </div>

        {/* Right side - Desktop */}
        <div className="app-nav-links">
          {/* Profile link */}
          <a
            href="/profile"
            style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", padding: "6px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", transition: "border-color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
          >
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--accent-dim)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "0.65rem", color: "var(--accent)" }}>
              {initials}
            </div>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              {displayName}
            </span>
          </a>

          {/* Sign out button (red) */}
          <button
            onClick={signOut}
            disabled={signingOut}
            style={{
              background: signingOut ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.35)",
              borderRadius: "var(--radius-md)",
              padding: "6px 14px",
              fontFamily: "var(--font-sans)", fontSize: "0.8rem", fontWeight: 600,
              color: signingOut ? "rgba(239,68,68,0.5)" : "var(--red)",
              cursor: signingOut ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 6,
            }}
            onMouseEnter={(e) => { if (!signingOut) { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.6)"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = signingOut ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.12)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.35)"; }}
          >
            {signingOut ? (
              <>
                <span style={{ width: 10, height: 10, border: "1.5px solid rgba(239,68,68,0.4)", borderTopColor: "var(--red)", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                Signing out…
              </>
            ) : "Sign out"}
          </button>
        </div>

        {/* Hamburger for Mobile */}
        <button
          className="app-nav-hamburger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <IconX /> : <IconMenu />}
        </button>
      </div>

      {/* Mobile drop-down */}
      <div className={`app-mobile-menu${menuOpen ? "" : " closed"}`}>
        <a href="/profile" className="app-mobile-link" onClick={() => setMenuOpen(false)}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--accent-dim)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "0.6rem", color: "var(--accent)" }}>
            {initials}
          </div>
          <span>Profile ({displayName})</span>
        </a>
        <button 
          onClick={() => { setMenuOpen(false); signOut(); }}
          disabled={signingOut}
          className="app-mobile-link"
          style={{ width: "100%", background: "none", border: "none", color: "var(--red)", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
        >
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </nav>
  );
}
