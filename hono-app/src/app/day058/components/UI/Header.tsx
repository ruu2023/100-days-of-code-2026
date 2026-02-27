"use client";

import { useState } from "react";
import { useCanvasStore } from "@/app/day058/store/useCanvasStore";
import { Button } from "@/components/ui/button";
import { Undo2, Redo2, Trash2, Download, Sparkles, Loader2 } from "lucide-react";

export function Header() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { undoStack, redoStack, undo, redo, clearAll, getCompositeCanvas } =
    useCanvasStore();

  const handleSave = () => {
    const comp = getCompositeCanvas();
    const link = document.createElement("a");
    link.download = "draw.png";
    link.href = comp.toDataURL("image/png");
    link.click();
  };

  const handleAIGenerate = async () => {
    const prompt = window.prompt(
      "画像生成のプロンプトを入力してください:",
      "プロのイラストレーターが描いたようなファンタジー風のイラストにして"
    );
    if (!prompt) return;

    try {
      setIsGenerating(true);
      const comp = getCompositeCanvas();
      const base64Image = comp.toDataURL("image/png");

      const response = await fetch("/api/day058/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, sketch: base64Image }),
      });

      if (!response.ok) {
        throw new Error("画像の生成に失敗しました");
      }

      const data = (await response.json()) as { image?: string; error?: string };
      if (data.image) {
        const link = document.createElement("a");
        link.download = "ai-generated.png";
        link.href = data.image;
        link.click();
      } else {
        throw new Error(data.error || "画像データがありません");
      }
    } catch (error) {
      console.error(error);
      alert("画像の生成中にエラーが発生しました。");
    } finally {
      setIsGenerating(false);
    }
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
          onClick={handleAIGenerate}
          disabled={isGenerating}
          className="h-8 px-3 bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
        >
          {isGenerating ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
          <span className="text-[11px] font-mono">{isGenerating ? 'AI生成中...' : 'AI生成'}</span>
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
