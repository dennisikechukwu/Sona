interface Props {
  onEndForAll: () => void;
  onEndForMe: () => void;
  onClose: () => void;
}

/* Modal shown when the host clicks "End call" — offers two options */
export default function EndCallModal({ onEndForAll, onEndForMe, onClose }: Props) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}
      onClick={onClose}
    >
      <div
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-xl)", padding: "2rem", width: "100%", maxWidth: 360, animation: "fadeIn 0.2s ease" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 800, fontSize: "1.25rem", color: "var(--text-primary)", marginBottom: "0.4rem", letterSpacing: "-0.01em" }}>
          End meeting
        </h2>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.83rem", color: "var(--text-muted)", marginBottom: "1.75rem", fontWeight: 300 }}>
          How would you like to end this meeting?
        </p>

        {/* End for everyone */}
        <button
          onClick={onEndForAll}
          style={{ width: "100%", background: "var(--red)", color: "#fff", border: "none", borderRadius: "var(--radius-md)", padding: "0.875rem 1.25rem", fontFamily: "var(--font-sans)", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", marginBottom: "0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "opacity 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <span>End for everyone</span>
          <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>Saves AI summary</span>
        </button>

        {/* Leave for me only */}
        <button
          onClick={onEndForMe}
          style={{ width: "100%", background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "0.875rem 1.25rem", fontFamily: "var(--font-sans)", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", marginBottom: "0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "border-color 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-strong)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
        >
          <span>Leave for me only</span>
          <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>Room stays open</span>
        </button>

        {/* Cancel */}
        <button
          onClick={onClose}
          style={{ width: "100%", background: "none", border: "none", color: "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: "0.82rem", cursor: "pointer", padding: "0.5rem" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
