"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useCanvasStore } from "@/app/day058/store/useCanvasStore";
import { useDrawing } from "./useDrawing";
import { CANVAS_W, CANVAS_H } from "@/app/day058/types";

export function DrawingCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLCanvasElement>(null);
  const compositeRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [cursor, setCursor] = useState({ x: 0, y: 0, visible: false });

  const {
    zoom, panX, panY,
    layers, tool,
    size: brushSize,
    adjustZoom, setPan, resetViewport,
    initLayers,
  } = useCanvasStore();

  // ── Init ─────────────────────────────────────────────
  useEffect(() => {
    initLayers();
  }, []); // eslint-disable-line

  // ── Resize ───────────────────────────────────────────
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ w: Math.floor(width), h: Math.floor(height) });
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    [bgRef, compositeRef, previewRef].forEach((ref) => {
      if (!ref.current) return;
      ref.current.width = size.w;
      ref.current.height = size.h;
    });
    renderAll();
  }, [size]); // eslint-disable-line

  // ── Render ───────────────────────────────────────────
  const getOffsets = useCallback(() => {
    const cw = CANVAS_W * zoom;
    const ch = CANVAS_H * zoom;
    const cx = (size.w - cw) / 2 + panX;
    const cy = (size.h - ch) / 2 + panY;
    return { cx, cy, cw, ch };
  }, [zoom, panX, panY, size]);

  const renderBg = useCallback(() => {
    const canvas = bgRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const { cx, cy, cw, ch } = getOffsets();

    ctx.fillStyle = "#eef0f5";
    ctx.fillRect(0, 0, size.w, size.h);

    // Drop shadow
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.15)";
    ctx.shadowBlur = 24;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(cx, cy, cw, ch);
    ctx.shadowBlur = 0;

    // Checkerboard
    const cs = Math.max(5, 10 * zoom);
    ctx.beginPath();
    ctx.rect(cx, cy, cw, ch);
    ctx.clip();
    for (let y = cy; y < cy + ch; y += cs) {
      for (let x = cx; x < cx + cw; x += cs) {
        const even =
          (Math.floor((x - cx) / cs) + Math.floor((y - cy) / cs)) % 2 === 0;
        ctx.fillStyle = even ? "#f0f0f0" : "#e4e4e4";
        ctx.fillRect(x, y, cs, cs);
      }
    }
    ctx.restore();
  }, [getOffsets, size]);

  const renderComposite = useCallback(() => {
    const canvas = compositeRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const { cx, cy, cw, ch } = getOffsets();

    ctx.clearRect(0, 0, size.w, size.h);
    ctx.save();
    ctx.imageSmoothingEnabled = zoom < 1;
    layers.forEach((layer) => {
      if (!layer.visible) return;
      ctx.globalAlpha = layer.opacity / 100;
      ctx.drawImage(layer.canvas, cx, cy, cw, ch);
    });
    ctx.globalAlpha = 1;
    ctx.restore();
  }, [layers, getOffsets, size, zoom]);

  const renderAll = useCallback(() => {
    renderBg();
    renderComposite();
  }, [renderBg, renderComposite]);

  // Re-render when layers or viewport changes
  useEffect(() => {
    renderAll();
  }, [layers, zoom, panX, panY, renderAll]);

  // ── Pointer events ────────────────────────────────────
  const getPos = (e: React.PointerEvent) => {
    const rect = previewRef.current!.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure > 0 ? e.pressure : 1,
    };
  };

  const { onPointerDown, onPointerMove, onPointerUp } = useDrawing({
    canvasWidth: size.w,
    canvasHeight: size.h,
    previewCtx: previewRef.current?.getContext("2d") ?? null,
    onRedraw: renderComposite,
  });

  // ── Pan ───────────────────────────────────────────────
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
      return;
    }
    if (e.button !== 0) return;
    const pos = getPos(e);
    onPointerDown(pos.x, pos.y, pos.pressure);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const pos = getPos(e);
    setCursor({ x: pos.x, y: pos.y, visible: true });

    if (isPanning.current) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPan(panX + dx, panY + dy);
      panStart.current = { x: e.clientX, y: e.clientY };
      return;
    }
    onPointerMove(pos.x, pos.y, pos.pressure);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isPanning.current = false;
    const pos = getPos(e);
    onPointerUp(pos.x, pos.y);
  };

  // ── Wheel zoom ────────────────────────────────────────
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    adjustZoom(e.deltaY < 0 ? 1.1 : 0.9);
  };

  // ── Cursor style ──────────────────────────────────────
  const cursorSize = Math.max(brushSize * zoom, 2);
  const cursorStyle =
    tool === "eraser"
      ? "cell"
      : tool === "eyedropper"
      ? "crosshair"
      : "none";

  return (
    <div
      ref={wrapRef}
      className="relative w-full h-full overflow-hidden bg-canvas-bg select-none"
      style={{ cursor: cursorStyle, touchAction: "none" }}
    >
      {/* Checkerboard bg */}
      <canvas ref={bgRef} className="absolute inset-0" />
      {/* Composite of all layers */}
      <canvas ref={compositeRef} className="absolute inset-0" />
      {/* Preview / shape overlay */}
      <canvas ref={previewRef} className="absolute inset-0" />

      {/* Custom cursor ring */}
      {cursor.visible && tool === "pen" && (
        <div
          className="pointer-events-none absolute rounded-full border border-gray-600/50"
          style={{
            width: cursorSize,
            height: cursorSize,
            left: cursor.x,
            top: cursor.y,
            transform: "translate(-50%, -50%)",
            transition: "width 0.04s, height 0.04s",
          }}
        />
      )}

      {/* Zoom indicator */}
      <div className="absolute bottom-3 right-3 font-mono text-[11px] text-text-muted bg-surface/80 px-2 py-1 rounded-md border border-border backdrop-blur-sm">
        {Math.round(zoom * 100)}%
      </div>

      {/* Event overlay */}
      <div
        className="absolute inset-0"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => setCursor((c) => ({ ...c, visible: false }))}
        onPointerEnter={() => setCursor((c) => ({ ...c, visible: true }))}
        onWheel={handleWheel}
      />
    </div>
  );
}
