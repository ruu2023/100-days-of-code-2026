"use client";

import { useCanvasStore } from "@/app/day057/store/useCanvasStore";
import { Button } from "@/components/ui/button";
import { Undo2, Redo2, Trash2, Download } from "lucide-react";

export function Header() {
  const { undoStack, redoStack, undo, redo, clearAll, getCompositeCanvas } =
    useCanvasStore();

  const handleSave = () => {
    const comp = getCompositeCanvas();
    const link = document.createElement("a");
    link.download = "draw.png";
    link.href = comp.toDataURL("image/png");
    link.click();
  };

  const handleClear = () => {
    if (!confirm("全てのレイヤーをクリアしますか？")) return;
    clearAll();
  };

  return (
    <header className="col-span-3 flex items-center gap-3 px-4 bg-surface border-b border-border h-12 z-10 shadow-sm">
      {/* Logo */}
      

      <span className="font-mono text-[11px] text-text-muted">
        1200 × 800
      </span>

      <div className="flex gap-1.5 ml-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={undoStack.length === 0}
          className="h-8 px-2.5 text-text-muted hover:text-text-base hover:bg-surface2 gap-1.5"
        >
          <Undo2 className="size-3.5" />
          <span className="text-[11px] font-mono">Undo</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={redoStack.length === 0}
          className="h-8 px-2.5 text-text-muted hover:text-text-base hover:bg-surface2 gap-1.5"
        >
          <Redo2 className="size-3.5" />
          <span className="text-[11px] font-mono">Redo</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="h-8 px-2.5 text-text-muted hover:text-red-500 hover:bg-red-50 gap-1.5"
        >
          <Trash2 className="size-3.5" />
          <span className="text-[11px] font-mono">Clear</span>
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          className="h-8 px-3 bg-accent hover:bg-accent/90 text-white gap-1.5"
        >
          <Download className="size-3.5" />
          <span className="text-[11px] font-mono">Save PNG</span>
        </Button>
      </div>
    </header>
  );
}
