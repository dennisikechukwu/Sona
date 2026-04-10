interface Props {
  label: string;
  icon: React.ReactNode;
  danger?: boolean;
  onClick: () => void;
}

/* Icon button used in the call toolbar — mic, camera, screen share */
export default function ToolbarBtn({ label, icon, danger, onClick }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <button
        onClick={onClick}
        title={label}
        style={{
          width: 44, height: 44,
          borderRadius: "var(--radius-md)",
          border: `1px solid ${danger ? "rgba(239,68,68,0.35)" : "var(--border-default)"}`,
          background: danger ? "var(--red-dim)" : "var(--bg-elevated)",
          color: "var(--text-primary)",
          fontSize: "1.1rem",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.15s, transform 0.1s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = danger ? "var(--red-dim)" : "var(--bg-elevated)"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        {icon}
      </button>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.6rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{label}</span>
    </div>
  );
}
