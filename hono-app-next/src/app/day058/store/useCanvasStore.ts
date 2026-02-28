import { create } from "zustand";
import type {
  ToolType,
  BrushType,
  Layer,
  HistoryEntry,
  LayerSnapshot,
} from "@/app/day058/types";
import { CANVAS_W, CANVAS_H, MAX_UNDO } from "@/app/day058/types";

function createLayerCanvas(name: string, id?: string): Layer {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  return {
    id: id ?? crypto.randomUUID(),
    name,
    canvas,
    visible: true,
    opacity: 100,
  };
}

function snapshotLayers(layers: Layer[]): LayerSnapshot[] {
  return layers.map((l) => ({
    id: l.id,
    name: l.name,
    imageData: l.canvas
      .getContext("2d")!
      .getImageData(0, 0, CANVAS_W, CANVAS_H),
    visible: l.visible,
    opacity: l.opacity,
  }));
}

function restoreFromSnapshot(snapshots: LayerSnapshot[]): Layer[] {
  return snapshots.map((s) => {
    const layer = createLayerCanvas(s.name, s.id);
    layer.visible = s.visible;
    layer.opacity = s.opacity;
    layer.canvas.getContext("2d")!.putImageData(s.imageData, 0, 0);
    return layer;
  });
}

// ── Store interface ────────────────────────────────────
interface CanvasStore {
  // Tool settings
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

  // ── Actions ──
  setTool: (tool: ToolType) => void;
  setBrushType: (brushType: BrushType) => void;
  setColor: (color: string) => void;
  setSize: (size: number) => void;
  setOpacity: (opacity: number) => void;
  setFlow: (flow: number) => void;
  setSmoothing: (smoothing: number) => void;

  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  adjustZoom: (delta: number) => void;
  resetViewport: () => void;

  // Layer actions
  initLayers: () => void;
  addLayer: () => void;
  deleteLayer: () => void;
  setActiveLayer: (index: number) => void;
  toggleLayerVisibility: (index: number) => void;
  setLayerOpacity: (index: number, opacity: number) => void;
  mergeLayers: () => void;
  duplicateLayer: () => void;
  reorderLayers: (from: number, to: number) => void;
  importImage: (imageElement: HTMLImageElement) => void;

  // History
  saveSnapshot: () => void;
  undo: () => void;
  redo: () => void;

  // Canvas ops
  clearAll: () => void;
  getCompositeCanvas: () => HTMLCanvasElement;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  tool: "pen",
  brushType: "round",
  color: "#000000",
  size: 5,
  opacity: 100,
  flow: 100,
  smoothing: 3,

  zoom: 1,
  panX: 0,
  panY: 0,

  layers: [],
  activeLayerIndex: 0,

  undoStack: [],
  redoStack: [],

  // ── Tool settings ──────────────────────────────────
  setTool: (tool) => set({ tool }),
  setBrushType: (brushType) => set({ brushType }),
  setColor: (color) => set({ color }),
  setSize: (size) => set({ size }),
  setOpacity: (opacity) => set({ opacity }),
  setFlow: (flow) => set({ flow }),
  setSmoothing: (smoothing) => set({ smoothing }),

  // ── Viewport ───────────────────────────────────────
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(8, zoom)) }),
  setPan: (panX, panY) => set({ panX, panY }),
  adjustZoom: (delta) => {
    const { zoom } = get();
    set({ zoom: Math.max(0.1, Math.min(8, zoom * delta)) });
  },
  resetViewport: () => set({ zoom: 1, panX: 0, panY: 0 }),

  // ── Layer actions ──────────────────────────────────
  initLayers: () => {
    const layer = createLayerCanvas("Layer 1");
    set({ layers: [layer], activeLayerIndex: 0 });
  },

  addLayer: () => {
    const { layers, activeLayerIndex } = get();
    const newLayer = createLayerCanvas(`Layer ${layers.length + 1}`);
    const newLayers = [...layers];
    newLayers.splice(activeLayerIndex + 1, 0, newLayer);
    set({
      layers: newLayers,
      activeLayerIndex: Math.min(activeLayerIndex + 1, newLayers.length - 1),
    });
  },

  deleteLayer: () => {
    const { layers, activeLayerIndex } = get();
    if (layers.length <= 1) return;
    const newLayers = layers.filter((_, i) => i !== activeLayerIndex);
    set({
      layers: newLayers,
      activeLayerIndex: Math.max(0, activeLayerIndex - 1),
    });
  },

  setActiveLayer: (index) => set({ activeLayerIndex: index }),

  toggleLayerVisibility: (index) => {
    const { layers } = get();
    const newLayers = layers.map((l, i) =>
      i === index ? { ...l, visible: !l.visible } : l
    );
    set({ layers: newLayers });
  },

  setLayerOpacity: (index, opacity) => {
    const { layers } = get();
    const newLayers = layers.map((l, i) =>
      i === index ? { ...l, opacity } : l
    );
    set({ layers: newLayers });
  },

  mergeLayers: () => {
    const { layers, activeLayerIndex } = get();
    const bottomIdx = activeLayerIndex - 1;
    if (bottomIdx < 0) return;

    const top = layers[activeLayerIndex];
    const bottom = layers[bottomIdx];
    const bCtx = bottom.canvas.getContext("2d")!;
    bCtx.globalAlpha = top.opacity / 100;
    bCtx.drawImage(top.canvas, 0, 0);
    bCtx.globalAlpha = 1;

    const newLayers = layers.filter((_, i) => i !== activeLayerIndex);
    set({ layers: newLayers, activeLayerIndex: bottomIdx });
  },

  duplicateLayer: () => {
    const { layers, activeLayerIndex } = get();
    const src = layers[activeLayerIndex];
    const dup = createLayerCanvas(`${src.name} copy`);
    dup.canvas.getContext("2d")!.drawImage(src.canvas, 0, 0);
    dup.visible = src.visible;
    dup.opacity = src.opacity;
    const newLayers = [...layers];
    newLayers.splice(activeLayerIndex + 1, 0, dup);
    set({ layers: newLayers, activeLayerIndex: activeLayerIndex + 1 });
  },

  reorderLayers: (from, to) => {
    const { layers } = get();
    const newLayers = [...layers];
    const [moved] = newLayers.splice(from, 1);
    newLayers.splice(to, 0, moved);
    set({ layers: newLayers, activeLayerIndex: to });
  },

  importImage: (imageElement) => {
    const { layers, activeLayerIndex } = get();
    const newLayer = createLayerCanvas(`Imported Image`);
    const ctx = newLayer.canvas.getContext("2d")!;
    
    // Scale image to fit within canvas dimensions while preserving aspect ratio
    const scale = Math.min(
      CANVAS_W / imageElement.width,
      CANVAS_H / imageElement.height,
    );
    // don't scale up small images
    const finalScale = scale < 1 ? scale : 1;

    const scaledWidth = imageElement.width * finalScale;
    const scaledHeight = imageElement.height * finalScale;
    const x = (CANVAS_W - scaledWidth) / 2;
    const y = (CANVAS_H - scaledHeight) / 2;

    ctx.drawImage(imageElement, x, y, scaledWidth, scaledHeight);

    const newLayers = [...layers];
    newLayers.splice(activeLayerIndex + 1, 0, newLayer);
    
    const newIndex = Math.min(activeLayerIndex + 1, newLayers.length - 1);
    set({
      layers: newLayers,
      activeLayerIndex: newIndex,
    });
    
    // Auto save state after import
    get().saveSnapshot();
  },

  // ── History ────────────────────────────────────────
  saveSnapshot: () => {
    const { layers, activeLayerIndex, undoStack } = get();
    const snapshot: HistoryEntry = {
      layers: snapshotLayers(layers),
      activeLayerIndex,
    };
    const newStack = [...undoStack, snapshot];
    if (newStack.length > MAX_UNDO) newStack.shift();
    set({ undoStack: newStack, redoStack: [] });
  },

  undo: () => {
    const { layers, activeLayerIndex, undoStack, redoStack } = get();
    if (!undoStack.length) return;
    const cur: HistoryEntry = {
      layers: snapshotLayers(layers),
      activeLayerIndex,
    };
    const snap = undoStack[undoStack.length - 1];
    set({
      layers: restoreFromSnapshot(snap.layers),
      activeLayerIndex: snap.activeLayerIndex,
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, cur],
    });
  },

  redo: () => {
    const { layers, activeLayerIndex, undoStack, redoStack } = get();
    if (!redoStack.length) return;
    const cur: HistoryEntry = {
      layers: snapshotLayers(layers),
      activeLayerIndex,
    };
    const snap = redoStack[redoStack.length - 1];
    set({
      layers: restoreFromSnapshot(snap.layers),
      activeLayerIndex: snap.activeLayerIndex,
      undoStack: [...undoStack, cur],
      redoStack: redoStack.slice(0, -1),
    });
  },

  // ── Canvas ops ─────────────────────────────────────
  clearAll: () => {
    const { layers } = get();
    layers.forEach((l) => l.canvas.getContext("2d")!.clearRect(0, 0, CANVAS_W, CANVAS_H));
    set({ layers: [...layers] }); // trigger re-render
  },

  getCompositeCanvas: () => {
    const { layers } = get();
    const comp = document.createElement("canvas");
    comp.width = CANVAS_W;
    comp.height = CANVAS_H;
    const ctx = comp.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    layers.forEach((l) => {
      if (!l.visible) return;
      ctx.globalAlpha = l.opacity / 100;
      ctx.drawImage(l.canvas, 0, 0);
    });
    ctx.globalAlpha = 1;
    return comp;
  },
}));
