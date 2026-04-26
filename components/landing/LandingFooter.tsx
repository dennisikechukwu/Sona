import SonaLogo from "@/components/shared/SonaLogo";

/* Site footer */
export default function LandingFooter() {
  const links = ["Privacy", "Terms", "Contact"];

  return (
    <footer style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <div className="footer-inner">
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SonaLogo size={20} />
          <span style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", fontWeight: 700, color: "var(--text-secondary)" }}>Sona</span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--text-muted)" }}>— AI-powered video calls</span>
        </div>

        {/* Links */}
        <div className="footer-links">
          {links.map((l) => (
            <a
              key={l}
              href="#"
              style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--text-muted)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >{l}</a>
          ))}
        </div>

        {/* Tech credits */}
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--text-muted)" }}>
          &copy; {new Date().getFullYear()} Sona. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
