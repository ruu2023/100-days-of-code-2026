import { getStroke } from "perfect-freehand";
import type { Point, BrushType } from "@/app/day057/types";

// ── Color utils ────────────────────────────────────────
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

export function hexWithOpacity(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── Point smoothing ────────────────────────────────────
export function smoothPoints(points: Point[], factor: number): Point[] {
  if (factor === 0 || points.length < 3) return points;
  const result: Point[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const w = Math.min(factor, i, points.length - 1 - i);
    let sx = 0, sy = 0, sp = 0, count = 0;
    for (let j = i - w; j <= i + w; j++) {
      sx += points[j].x;
      sy += points[j].y;
      sp += points[j].p;
      count++;
    }
    result.push({ x: sx / count, y: sy / count, p: sp / count });
  }
  result.push(points[points.length - 1]);
  return result;
}

// ── Perfect freehand stroke ────────────────────────────
export function getSvgPathFromStroke(stroke: number[][]): string {
  if (!stroke.length) return "";
  const d = stroke.reduce<(string | number)[]>(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );
  d.push("Z");
  return d.join(" ");
}

// ── Draw stroke onto canvas ────────────────────────────
export function drawStroke(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  size: number,
  opacity: number,
  flow: number,
  brushType: BrushType,
  smoothing: number
): void {
  if (points.length < 2) return;

  const alpha = (opacity / 100) * (flow / 100);
  const smoothed = smoothPoints(points, smoothing);

  ctx.save();

  switch (brushType) {
    case "round": {
      // Use perfect-freehand for beautiful pressure-sensitive strokes
      const stroke = getStroke(
        smoothed.map((p) => [p.x, p.y, p.p]),
        {
          size,
          thinning: 0.5,
          smoothing: 0.5,
          streamline: 0.4,
          easing: (t) => Math.sin((t * Math.PI) / 2),
          simulatePressure: true,
        }
      );
      const pathData = getSvgPathFromStroke(stroke);
      const path = new Path2D(pathData);
      ctx.fillStyle = hexWithOpacity(color, alpha);
      ctx.fill(path);
      break;
    }

    case "flat": {
      for (let i = 1; i < smoothed.length; i++) {
        const pt = smoothed[i];
        const prev = smoothed[i - 1];
        const angle = Math.atan2(pt.y - prev.y, pt.x - prev.x);
        ctx.fillStyle = hexWithOpacity(color, alpha * 0.8);
        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(angle + Math.PI / 2);
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.22 * pt.p, size * 0.85 * pt.p, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      break;
    }

    case "pencil": {
      if (smoothed.length < 2) break;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = hexWithOpacity(color, 1);
      ctx.globalAlpha = alpha;

      for (let i = 1; i < smoothed.length - 1; i++) {
        const pt = smoothed[i];
        const next = smoothed[i + 1];
        const mx = (pt.x + next.x) / 2;
        const my = (pt.y + next.y) / 2;
        const prevMx = i === 1 ? smoothed[0].x : (smoothed[i - 1].x + pt.x) / 2;
        const prevMy = i === 1 ? smoothed[0].y : (smoothed[i - 1].y + pt.y) / 2;

        // 筆圧は線幅のみに反映
        ctx.lineWidth = size * 0.3 + size * 0.7 * (pt.p ?? 1);

        ctx.beginPath();
        ctx.moveTo(prevMx, prevMy);
        ctx.quadraticCurveTo(pt.x, pt.y, mx, my);
        ctx.stroke();
      }
      break;
    }
    case "spray": {
      smoothed.forEach((pt, i) => {
        if (i % 3 !== 0) return;
        ctx.fillStyle = hexWithOpacity(color, alpha * 0.6);
        const radius = size * 1.5;
        const density = Math.floor(size * 0.8);
        for (let j = 0; j < density; j++) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * radius;
          ctx.beginPath();
          ctx.arc(
            pt.x + Math.cos(angle) * r,
            pt.y + Math.sin(angle) * r,
            0.6,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      });
      break;
    }
  }

  ctx.restore();
}

// ── Draw eraser ────────────────────────────────────────
export function drawEraser(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  size: number
): void {
  if (points.length < 2) return;
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.lineWidth = size * 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(0,0,0,1)";
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const mid = {
      x: (points[i - 1].x + points[i].x) / 2,
      y: (points[i - 1].y + points[i].y) / 2,
    };
    ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, mid.x, mid.y);
  }
  ctx.stroke();
  ctx.restore();
}

// ── Draw shape on canvas ───────────────────────────────
export function drawShape(
  ctx: CanvasRenderingContext2D,
  tool: "line" | "rect" | "ellipse",
  start: Point,
  end: Point,
  color: string,
  size: number,
  opacity: number
): void {
  ctx.save();
  ctx.strokeStyle = hexWithOpacity(color, opacity / 100);
  ctx.lineWidth = size;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  switch (tool) {
    case "line":
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      break;
    case "rect":
      ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
      break;
    case "ellipse": {
      const rx = Math.abs(end.x - start.x) / 2;
      const ry = Math.abs(end.y - start.y) / 2;
      ctx.ellipse(
        (start.x + end.x) / 2,
        (start.y + end.y) / 2,
        rx,
        ry,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      break;
    }
  }
  ctx.restore();
}

// ── Coord transform ────────────────────────────────────
export function screenToCanvas(
  sx: number,
  sy: number,
  canvasWidth: number,
  canvasHeight: number,
  zoom: number,
  panX: number,
  panY: number,
  CANVAS_W: number,
  CANVAS_H: number
): Point {
  const cw = CANVAS_W * zoom;
  const ch = CANVAS_H * zoom;
  const cx = (canvasWidth - cw) / 2 + panX;
  const cy = (canvasHeight - ch) / 2 + panY;
  return {
    x: (sx - cx) / zoom,
    y: (sy - cy) / zoom,
    p: 1,
  };
}

// ── Pick color from composited layers ─────────────────
export function pickColorFromLayers(
  layers: { canvas: HTMLCanvasElement; visible: boolean }[],
  x: number,
  y: number,
  CANVAS_W: number,
  CANVAS_H: number
): string | null {
  const comp = document.createElement("canvas");
  comp.width = CANVAS_W;
  comp.height = CANVAS_H;
  const ctx = comp.getContext("2d")!;
  layers.forEach((l) => {
    if (l.visible) ctx.drawImage(l.canvas, 0, 0);
  });
  const px = Math.floor(x);
  const py = Math.floor(y);
  if (px < 0 || py < 0 || px >= CANVAS_W || py >= CANVAS_H) return null;
  const [r, g, b] = ctx.getImageData(px, py, 1, 1).data;
  return rgbToHex(r, g, b);
}
