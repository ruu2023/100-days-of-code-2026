"use client";

import { useRef, useState } from "react";
import { useCanvasStore } from "@/app/day058/store/useCanvasStore";
import { Button } from "@/components/ui/button";
import { Undo2, Redo2, Trash2, Download, Sparkles, Loader2, ImagePlus, X } from "lucide-react";

export function Header() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [secondImageBase64, setSecondImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aiPromptRef = useRef<string>("");
  const { undoStack, redoStack, undo, redo, clearAll, getCompositeCanvas } =
    useCanvasStore();

  const handleSave = () => {
    const comp = getCompositeCanvas();
    const link = document.createElement("a");
    link.download = "draw.png";
    link.href = comp.toDataURL("image/png");
    link.click();
  };

  const executeAIGeneration = async () => {
    try {
      setIsGenerating(true);
      const comp = getCompositeCanvas();
      const sketchBase64 = comp.toDataURL("image/png");

      const bodyData: any = { 
        prompt: aiPromptRef.current, 
        sketch: sketchBase64 
      };
      if (secondImageBase64) {
        bodyData.additionalImage = secondImageBase64;
      }

      const response = await fetch("/api/day058/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
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
      // Reset inputs after successful generation (optional, can keep it if user wants to regen with same image)
      // setSecondImageBase64(null);
      // if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAIGenerate = async () => {
    const prompt = window.prompt(
      "画像生成のプロンプトを入力してください:",
      "プロのイラストレーターが描いたようなファンタジー風のイラストにして"
    );
    if (!prompt) return;
    
    aiPromptRef.current = prompt;

    await executeAIGeneration();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSecondImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const clearSecondImage = () => {
    setSecondImageBase64(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        {secondImageBase64 ? (
          <div className="flex items-center gap-1 bg-surface2 px-2 h-8 rounded-md border border-border">
            <span className="text-[10px] text-text-base truncate max-w-[80px]">画像選択済</span>
            <button 
              onClick={clearSecondImage}
              className="text-text-muted hover:text-red-500 rounded-full p-0.5 hover:bg-surface"
              title="画像をクリア"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 px-2.5 text-text-muted hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 gap-1.5"
            title="AI生成用の2枚目の画像を追加"
          >
            <ImagePlus className="size-3.5" />
            <span className="text-[11px] font-mono">2枚目画像</span>
          </Button>
        )}
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
