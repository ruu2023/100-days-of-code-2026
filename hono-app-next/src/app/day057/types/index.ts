// ── Tool types ─────────────────────────────────────────
export type ToolType =
  | "pen"
  | "eraser"
  | "eyedropper"
  | "line"
  | "rect"
  | "ellipse";

export type BrushType = "round" | "flat" | "pencil" | "spray";

// ── Point ──────────────────────────────────────────────
export interface Point {
  x: number;
  y: number;
  p: number; // pressure 0-1
}

// ── Layer ─────────────────────────────────────────────
export interface Layer {
  id: string;
  name: string;
  canvas: HTMLCanvasElement;
  visible: boolean;
  opacity: number; // 0-100
}

// ── Stroke snapshot (for undo) ─────────────────────────
export interface LayerSnapshot {
  id: string;
  name: string;
  imageData: ImageData;
  visible: boolean;
  opacity: number;
}

export interface HistoryEntry {
  layers: LayerSnapshot[];
  activeLayerIndex: number;
}

// ── Canvas state ───────────────────────────────────────
export interface CanvasState {
  // Tool
  tool: ToolType;
  brushType: BrushType;
  color: string;
  size: number;
  opacity: number;
  flow: number;
  smoothing: number;

  // Viewport
  zoom: number;
  panX: number;
  panY: number;

  // Layers
  layers: Layer[];
  activeLayerIndex: number;

  // History
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];
}

// ── Canvas dimensions ──────────────────────────────────
export const CANVAS_W = 1200;
export const CANVAS_H = 800;
export const MAX_UNDO = 40;

// ── Default swatches ───────────────────────────────────
export const SWATCHES = [
  "#0f0f11", "#2a2a35", "#6b6b80", "#e8e8f0",
  "#7c6aff", "#ff6a9b", "#6affa0", "#ffca6a",
  "#6aeaff", "#ff6a6a", "#b06aff", "#ff9e6a",
  "#3a7bff", "#a0ff6a", "#ff6adb", "#6affd4",
];
