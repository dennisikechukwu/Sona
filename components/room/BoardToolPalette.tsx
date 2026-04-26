"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Undo2, Trash2, X, GripHorizontal } from "lucide-react";

const COLORS = [
  { color: "#ffffff", label: "White" },
  { color: "#22c55e", label: "Green" },
  { color: "#ef4444", label: "Red" },
  { color: "#facc15", label: "Yellow" },
  { color: "#3b82f6", label: "Blue" },
  { color: "#f97316", label: "Orange" },
];

const SIZES = [2, 4, 8, 12];

interface Props {
  activeColor: string;
  activeSize: number;
  onColorChange: (color: string) => void;
  onSizeChange: (size: number) => void;
  onUndo: () => void;
  onClear: () => void;
  onClose: () => void;
  canUndo: boolean;
}

/* Floating draggable glassmorphism tool palette — shown to the presenter */
export default function BoardToolPalette({
  activeColor, activeSize, onColorChange, onSizeChange, onUndo, onClear, onClose, canUndo,
}: Props) {
  const paletteRef = useRef<HTMLDivElement>(null);

  // ── Drag state ──────────────────────────────────────────────────────────
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Initialize position to centered at bottom
  useEffect(() => {
    if (!paletteRef.current) return;
    const rect = paletteRef.current.getBoundingClientRect();
    const parent = paletteRef.current.parentElement;
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    setPosition({
      x: (parentRect.width - rect.width) / 2,
      y: parentRect.height - rect.height - 84,
    });
  }, []);

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    if (!paletteRef.current) return;
    isDragging.current = true;
    const rect = paletteRef.current.getBoundingClientRect();
    const parent = paletteRef.current.parentElement;
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    dragOffset.current = {
      x: clientX - (rect.left - parentRect.left),
      y: clientY - (rect.top - parentRect.top),
    };
    document.body.style.userSelect = "none";
  }, []);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging.current || !paletteRef.current) return;
    const parent = paletteRef.current.parentElement;
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    const paletteRect = paletteRef.current.getBoundingClientRect();

    let newX = clientX - dragOffset.current.x;
    let newY = clientY - dragOffset.current.y;

    // Clamp within parent bounds
    newX = Math.max(0, Math.min(newX, parentRect.width - paletteRect.width));
    newY = Math.max(0, Math.min(newY, parentRect.height - paletteRect.height));

    setPosition({ x: newX, y: newY });
  }, []);

  const handleDragEnd = useCallback(() => {
    isDragging.current = false;
    document.body.style.userSelect = "";
  }, []);

  // Mouse events
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
    const onMouseUp = () => handleDragEnd();
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [handleDragMove, handleDragEnd]);

  // Touch events
  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging.current && e.touches.length === 1) {
        e.preventDefault();
        handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => handleDragEnd();
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  return (
    <div
      ref={paletteRef}
      className="board-tool-palette"
      style={{
        position: "absolute",
        ...(position
          ? { left: position.x, top: position.y, transform: "none" }
          : { bottom: 84, left: "50%", transform: "translateX(-50%)" }
        ),
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(18,20,26,0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16,
        padding: "8px 14px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        animation: position ? "none" : "paletteIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <style>{`
        @keyframes paletteIn {
          from { opacity: 0; transform: translateX(-50%) scale(0.9) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) scale(1) translateY(0); }
        }
      `}</style>

      {/* Drag handle */}
      <div
        onMouseDown={(e) => { e.preventDefault(); handleDragStart(e.clientX, e.clientY); }}
        onTouchStart={(e) => { if (e.touches.length === 1) handleDragStart(e.touches[0].clientX, e.touches[0].clientY); }}
        style={{
          cursor: "grab",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          borderRadius: 6,
          color: "rgba(255,255,255,0.3)",
          flexShrink: 0,
          touchAction: "none",
        }}
        title="Drag to move"
      >
        <GripHorizontal size={14} />
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />

      {/* Color swatches */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {COLORS.map(({ color, label }) => (
          <button
            key={color}
            title={label}
            onClick={() => onColorChange(color)}
            style={{
              width: 22, height: 22,
              borderRadius: "50%",
              background: color,
              border: activeColor === color
                ? "2px solid var(--accent)"
                : "2px solid transparent",
              outline: activeColor === color
                ? "2px solid rgba(34,197,94,0.3)"
                : "none",
              cursor: "pointer",
              transition: "transform 0.15s, outline 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.15)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          />
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.08)", margin: "0 4px", flexShrink: 0 }} />

      {/* Brush sizes */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {SIZES.map((size) => (
          <button
            key={size}
            title={`${size}px`}
            onClick={() => onSizeChange(size)}
            style={{
              width: 28, height: 28,
              borderRadius: 6,
              background: activeSize === size ? "rgba(255,255,255,0.1)" : "transparent",
              border: activeSize === size ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
          >
            <div style={{
              width: Math.max(size, 4),
              height: Math.max(size, 4),
              borderRadius: "50%",
              background: activeColor,
            }} />
          </button>
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.08)", margin: "0 4px", flexShrink: 0 }} />

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
          style={{
            width: 32, height: 32, borderRadius: 8,
            background: "none", border: "none",
            color: canUndo ? "var(--text-primary)" : "var(--text-muted)",
            cursor: canUndo ? "pointer" : "not-allowed",
            opacity: canUndo ? 1 : 0.35,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => { if (canUndo) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
        >
          <Undo2 size={16} />
        </button>

        {/* Clear */}
        <button
          onClick={onClear}
          title="Clear all"
          style={{
            width: 32, height: 32, borderRadius: 8,
            background: "none", border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "var(--red)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-secondary)"; }}
        >
          <Trash2 size={16} />
        </button>

        {/* Close board */}
        <button
          onClick={onClose}
          title="Close board"
          style={{
            width: 32, height: 32, borderRadius: 8,
            background: "none", border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
