"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { RoomEvent } from "livekit-client";
import type { Room } from "livekit-client";
import BoardToolPalette from "./BoardToolPalette";

/* ── Stroke type ──────────────────────────────────────────────────────────── */
interface Stroke {
  points: [number, number][];  // normalized 0-1 coordinates
  color: string;
  width: number;
}

interface Props {
  isPresenter: boolean; // true for the person who opened the board
  presenterName: string;
  room: Room;
  onClose: () => void;
}

/**
 * PresenterBoard — full-area drawing canvas.
 *
 * Presenter:    The person who opened the board. Can draw with mouse/touch.
 *               Strokes are broadcast to all participants via LiveKit data channel.
 * Viewers:      Read-only canvas that renders incoming strokes in real-time.
 */
export default function PresenterBoard({ isPresenter, presenterName, room, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Drawing state
  const [brushColor, setBrushColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(4);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const strokesRef = useRef<Stroke[]>([]);

  // Keep ref in sync
  useEffect(() => { strokesRef.current = strokes; }, [strokes]);

  // ── Canvas sizing ─────────────────────────────────────────────────────────
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
    // Redraw all strokes after resize
    redrawAll(canvas);
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  // Redraw after strokes change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) redrawAll(canvas);
  }, [strokes]);

  // ── Redraw all strokes ────────────────────────────────────────────────────
  function redrawAll(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Draw all completed strokes
    for (const stroke of strokesRef.current) {
      drawStroke(ctx, stroke, w, h);
    }

    // Draw current in-progress stroke
    if (currentStrokeRef.current && currentStrokeRef.current.points.length > 1) {
      drawStroke(ctx, currentStrokeRef.current, w, h);
    }
  }

  function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke, w: number, h: number) {
    if (stroke.points.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const [sx, sy] = stroke.points[0];
    ctx.moveTo(sx * w, sy * h);
    for (let i = 1; i < stroke.points.length; i++) {
      const [px, py] = stroke.points[i];
      ctx.lineTo(px * w, py * h);
    }
    ctx.stroke();
  }

  // ── Coordinate helpers ────────────────────────────────────────────────────
  function getNormalizedPos(e: React.MouseEvent | React.TouchEvent): [number, number] | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return [
      (clientX - rect.left) / rect.width,
      (clientY - rect.top) / rect.height,
    ];
  }

  // ── Broadcast helpers ─────────────────────────────────────────────────────
  function broadcast(data: object) {
    if (room.state !== "connected") return;
    const encoded = new TextEncoder().encode(JSON.stringify(data));
    room.localParticipant.publishData(encoded, { reliable: true });
  }

  // ── Drawing handlers (presenter only) ─────────────────────────────────────
  function handlePointerDown(e: React.MouseEvent | React.TouchEvent) {
    if (!isPresenter) return;
    const pos = getNormalizedPos(e);
    if (!pos) return;
    isDrawingRef.current = true;
    currentStrokeRef.current = { points: [pos], color: brushColor, width: brushSize };
  }

  function handlePointerMove(e: React.MouseEvent | React.TouchEvent) {
    if (!isPresenter || !isDrawingRef.current || !currentStrokeRef.current) return;
    const pos = getNormalizedPos(e);
    if (!pos) return;
    currentStrokeRef.current.points.push(pos);

    // Redraw live
    const canvas = canvasRef.current;
    if (canvas) redrawAll(canvas);

    // Broadcast current stroke in real-time
    broadcast({
      type: "board_stroke",
      points: currentStrokeRef.current.points,
      color: currentStrokeRef.current.color,
      width: currentStrokeRef.current.width,
      done: false,
    });
  }

  function handlePointerUp() {
    if (!isPresenter || !isDrawingRef.current || !currentStrokeRef.current) return;
    isDrawingRef.current = false;

    // Only save strokes with more than 1 point
    if (currentStrokeRef.current.points.length > 1) {
      const finalStroke = { ...currentStrokeRef.current };
      setStrokes((prev) => [...prev, finalStroke]);
      strokesRef.current = [...strokesRef.current, finalStroke];

      // Broadcast completed stroke
      broadcast({
        type: "board_stroke",
        points: finalStroke.points,
        color: finalStroke.color,
        width: finalStroke.width,
        done: true,
      });
    }
    currentStrokeRef.current = null;
  }

  // ── Undo / Clear (presenter only) ─────────────────────────────────────────
  function handleUndo() {
    if (!isPresenter) return;
    setStrokes((prev) => {
      const next = prev.slice(0, -1);
      strokesRef.current = next;
      return next;
    });
    broadcast({ type: "board_undo" });
  }

  function handleClear() {
    if (!isPresenter) return;
    setStrokes([]);
    strokesRef.current = [];
    currentStrokeRef.current = null;
    broadcast({ type: "board_clear" });
  }

  // ── Receive strokes from presenter (viewers) ──────────────────────────────
  useEffect(() => {
    if (isPresenter) return; // Presenter doesn't need to listen — they're the source

    function handleData(payload: Uint8Array) {
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload));
        if (msg.type === "board_stroke") {
          const stroke: Stroke = { points: msg.points, color: msg.color, width: msg.width };
          if (msg.done) {
            // Completed stroke — add to array
            setStrokes((prev) => {
              const next = [...prev, stroke];
              strokesRef.current = next;
              return next;
            });
          } else {
            // In-progress stroke — draw live without saving
            currentStrokeRef.current = stroke;
            const canvas = canvasRef.current;
            if (canvas) redrawAll(canvas);
          }
        }
        if (msg.type === "board_undo") {
          setStrokes((prev) => {
            const next = prev.slice(0, -1);
            strokesRef.current = next;
            return next;
          });
        }
        if (msg.type === "board_clear") {
          setStrokes([]);
          strokesRef.current = [];
          currentStrokeRef.current = null;
        }
      } catch { }
    }

    room.on(RoomEvent.DataReceived, handleData);
    return () => { room.off(RoomEvent.DataReceived, handleData); };
  }, [isPresenter, room]);

  return (
    <div
      ref={wrapRef}
      className="board-canvas-wrap"
      style={{
        flex: 1,
        position: "relative",
        background: "#0f1117",
        overflow: "hidden",
        animation: "fadeIn 0.3s ease",
      }}
    >
      {/* Board label */}
      <div style={{
        position: "absolute", top: 12, left: 16, zIndex: 20,
        display: "flex", alignItems: "center", gap: 8,
        background: "rgba(18,20,26,0.75)", backdropFilter: "blur(8px)",
        borderRadius: 8, padding: "5px 12px",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: "blink 1.5s infinite" }} />
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 500 }}>
          {isPresenter
            ? "Presenter Board"
            : `${presenterName || "Someone"} is presenting`
          }
        </span>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          cursor: isPresenter ? "crosshair" : "default",
          touchAction: "none", // Prevent scroll on touch devices
        }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />

      {/* Presenter tool palette (draggable) */}
      {isPresenter && (
        <BoardToolPalette
          activeColor={brushColor}
          activeSize={brushSize}
          onColorChange={setBrushColor}
          onSizeChange={setBrushSize}
          onUndo={handleUndo}
          onClear={handleClear}
          onClose={onClose}
          canUndo={strokes.length > 0}
        />
      )}
    </div>
  );
}
