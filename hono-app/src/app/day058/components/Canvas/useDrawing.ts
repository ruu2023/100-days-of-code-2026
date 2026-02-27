"use client";

import { useRef, useCallback } from "react";
import { useCanvasStore } from "@/app/day058/store/useCanvasStore";
import {
  drawStroke,
  drawEraser,
  drawShape,
  screenToCanvas,
  pickColorFromLayers,
} from "@/app/day058/lib/drawing";
import type { Point } from "@/app/day058/types";
import { CANVAS_W, CANVAS_H } from "@/app/day058/types";

interface UseDrawingOptions {
  canvasWidth: number;
  canvasHeight: number;
  previewCtx: CanvasRenderingContext2D | null;
  onRedraw: () => void;
}

export function useDrawing({
  canvasWidth,
  canvasHeight,
  previewCtx,
  onRedraw,
}: UseDrawingOptions) {
  const isDrawing = useRef(false);
  const points = useRef<Point[]>([]);
  const shapeStart = useRef<Point | null>(null);

  const {
    tool,
    brushType,
    color,
    size,
    opacity,
    flow,
    smoothing,
    zoom,
    panX,
    panY,
    layers,
    activeLayerIndex,
    setColor,
    setTool,
    saveSnapshot,
  } = useCanvasStore();

  const toCanvas = useCallback(
    (sx: number, sy: number): Point =>
      screenToCanvas(sx, sy, canvasWidth, canvasHeight, zoom, panX, panY, CANVAS_W, CANVAS_H),
    [canvasWidth, canvasHeight, zoom, panX, panY]
  );

  const getActiveCtx = useCallback((): CanvasRenderingContext2D | null => {
    const layer = layers[activeLayerIndex];
    return layer ? layer.canvas.getContext("2d") : null;
  }, [layers, activeLayerIndex]);

  // Clear preview canvas
  const clearPreview = useCallback(() => {
    if (!previewCtx) return;
    previewCtx.clearRect(0, 0, previewCtx.canvas.width, previewCtx.canvas.height);
  }, [previewCtx]);

  // Draw shape preview on overlay canvas
  const drawPreviewShape = useCallback(
    (start: Point, end: Point) => {
      if (!previewCtx || !["line", "rect", "ellipse"].includes(tool)) return;
      clearPreview();

      const w = canvasWidth, h = canvasHeight;
      const cw = CANVAS_W * zoom, ch = CANVAS_H * zoom;
      const ox = (w - cw) / 2 + panX;
      const oy = (h - ch) / 2 + panY;

      const toScreen = (p: Point) => ({
        x: p.x * zoom + ox,
        y: p.y * zoom + oy,
        p: p.p,
      });

      const s = toScreen(start);
      const e = toScreen(end);

      drawShape(
        previewCtx,
        tool as "line" | "rect" | "ellipse",
        s,
        e,
        color,
        size * zoom,
        opacity
      );
    },
    [previewCtx, tool, canvasWidth, canvasHeight, zoom, panX, panY, color, size, opacity, clearPreview]
  );

  const strokeSnapshot = useRef<ImageData | null>(null);

  const onPointerDown = useCallback(
    (sx: number, sy: number, pressure: number) => {
      if (tool === "eyedropper") {
          const cp = toCanvas(sx, sy);
          const picked = pickColorFromLayers(layers, cp.x, cp.y, CANVAS_W, CANVAS_H);
          if (picked) {
            setColor(picked);
            setTool("pen");
          }
          return;
        }
        saveSnapshot();
        isDrawing.current = true;

        if (["line", "rect", "ellipse"].includes(tool)) {
          shapeStart.current = toCanvas(sx, sy);
          return;
        }

        const ctx = getActiveCtx();
        if (ctx) {
          strokeSnapshot.current = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
        }
        const cp = toCanvas(sx, sy);
        points.current = [{ ...cp, p: pressure }];
      },
      [tool, toCanvas, layers, getActiveCtx, setColor, setTool, saveSnapshot]
    );
  const onPointerMove = useCallback(
    (sx: number, sy: number, pressure: number) => {
      if (!isDrawing.current) return;

      if (["line", "rect", "ellipse"].includes(tool) && shapeStart.current) {
        drawPreviewShape(shapeStart.current, toCanvas(sx, sy));
        return;
      }

      const cp = toCanvas(sx, sy);
      points.current.push({ ...cp, p: pressure });

      const ctx = getActiveCtx();
      if (!ctx) return;

      if (tool === "eraser") {
        drawEraser(ctx, points.current.slice(-10), size);
      } else {
        // スナップショットに戻してから全点列で再描画
        if (strokeSnapshot.current) {
          ctx.putImageData(strokeSnapshot.current, 0, 0);
        }
        drawStroke(ctx, points.current, color, size, opacity, flow, brushType, smoothing);
      }
      onRedraw();
    },
    [tool, toCanvas, getActiveCtx, size, color, opacity, flow, brushType, smoothing, drawPreviewShape, onRedraw]
  );

  const onPointerUp = useCallback(
    (sx: number, sy: number) => {
      if (!isDrawing.current) return;
      isDrawing.current = false;
      strokeSnapshot.current = null;

      if (["line", "rect", "ellipse"].includes(tool) && shapeStart.current) {
        const ctx = getActiveCtx();
        if (ctx) {
          drawShape(ctx, tool as "line" | "rect" | "ellipse", shapeStart.current, toCanvas(sx, sy), color, size, opacity);
        }
        clearPreview();
        shapeStart.current = null;
        onRedraw();
        return;
      }

      points.current = [];
      onRedraw();
    },
    [tool, getActiveCtx, toCanvas, color, size, opacity, clearPreview, onRedraw]
  );
  return { onPointerDown, onPointerMove, onPointerUp, isDrawingRef: isDrawing };
}
