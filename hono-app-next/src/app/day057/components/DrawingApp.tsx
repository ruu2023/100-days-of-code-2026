"use client";

import { DrawingCanvas } from "@/app/day057/components/Canvas/DrawingCanvas";
import { Toolbar } from "@/app/day057/components/Toolbar/Toolbar";
import { BrushPanel } from "@/app/day057/components/Toolbar/BrushPanel";
import { LayersPanel } from "@/app/day057/components/Layers/LayersPanel";
import { Header } from "@/app/day057/components/UI/Header";
import { useKeyboardShortcuts } from "@/app/day057/components/UI/useKeyboardShortcuts";

export default function DrawingApp() {
  useKeyboardShortcuts();

  return (
    <div className="grid h-screen w-screen overflow-hidden"
      style={{ gridTemplateColumns: "56px 1fr 200px", gridTemplateRows: "48px 1fr" }}
    >
      {/* Header spans full width */}
      <Header />

      {/* Left toolbar */}
      <Toolbar />

      {/* Main canvas */}
      <main className="overflow-hidden">
        <DrawingCanvas />
      </main>

      {/* Right panel */}
      <aside className="bg-surface border-l border-border overflow-y-auto p-3 flex flex-col gap-4">
        <BrushPanel />
        <div className="w-full h-px bg-border" />
        <LayersPanel />
      </aside>
    </div>
  );
}
