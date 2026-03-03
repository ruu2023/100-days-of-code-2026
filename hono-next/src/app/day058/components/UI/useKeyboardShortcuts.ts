"use client";

import { useEffect } from "react";
import { useCanvasStore } from "@/app/day058/store/useCanvasStore";

export function useKeyboardShortcuts() {
  const {
    setTool, setSize, size,
    undo, redo,
    adjustZoom, resetViewport,
  } = useCanvasStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
        return;
      }

      // Tools
      const toolMap: Record<string, Parameters<typeof setTool>[0]> = {
        p: "pen", e: "eraser", i: "eyedropper",
        l: "line", r: "rect", o: "ellipse",
      };
      if (!e.ctrlKey && !e.metaKey && toolMap[e.key]) {
        setTool(toolMap[e.key]);
        return;
      }

      // Zoom
      if (e.key === "+" || e.key === "=") adjustZoom(1.25);
      if (e.key === "-") adjustZoom(0.8);
      if (e.key === "0") resetViewport();

      // Brush size
      if (e.key === "[") {
        const s = Math.max(1, size - 2);
        setSize(s);
        const slider = document.getElementById("size-slider") as HTMLInputElement;
        if (slider) slider.value = String(s);
      }
      if (e.key === "]") {
        const s = Math.min(100, size + 2);
        setSize(s);
        const slider = document.getElementById("size-slider") as HTMLInputElement;
        if (slider) slider.value = String(s);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setTool, setSize, size, undo, redo, adjustZoom, resetViewport]);
}
