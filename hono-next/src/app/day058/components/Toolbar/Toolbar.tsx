"use client";

import { useCanvasStore } from "@/app/day058/store/useCanvasStore";
import type { ToolType } from "@/app/day058/types";
import { Button } from "@/components/ui/button";
import { Pen, Eraser, Pipette, Minus, Square, Circle, ZoomIn, ZoomOut } from "lucide-react";

const TOOLS: { id: ToolType; icon: React.ReactNode; label: string; key: string }[] = [
  { id: "pen",        icon: <Pen className="size-4" />,      label: "ペン",    key: "P" },
  { id: "eraser",     icon: <Eraser className="size-4" />,   label: "消しゴム", key: "E" },
  { id: "eyedropper", icon: <Pipette className="size-4" />,  label: "スポイト", key: "I" },
];

const SHAPES: { id: ToolType; icon: React.ReactNode; label: string; key: string }[] = [
  { id: "line",    icon: <Minus  className="size-4" />,  label: "直線",   key: "L" },
  { id: "rect",    icon: <Square className="size-4" />,  label: "四角形", key: "R" },
  { id: "ellipse", icon: <Circle className="size-4" />,  label: "楕円",   key: "O" },
];

export function Toolbar() {
  const { tool, setTool, adjustZoom, resetViewport } = useCanvasStore();

  return (
    <aside className="flex flex-col items-center bg-surface border-r border-border py-2 gap-0.5 w-14 shadow-sm">
      {TOOLS.map((t) => (
        <ToolButton
          key={t.id}
          icon={t.icon}
          label={`${t.label} (${t.key})`}
          active={tool === t.id}
          onClick={() => setTool(t.id)}
        />
      ))}

      <Divider />

      {SHAPES.map((t) => (
        <ToolButton
          key={t.id}
          icon={t.icon}
          label={`${t.label} (${t.key})`}
          active={tool === t.id}
          onClick={() => setTool(t.id)}
        />
      ))}

      <Divider />

      <ToolButton icon={<ZoomIn  className="size-4" />} label="ズームイン (+)"  onClick={() => adjustZoom(1.25)} />
      <ToolButton icon={<ZoomOut className="size-4" />} label="ズームアウト (-)" onClick={() => adjustZoom(0.8)} />
      <button
        title="リセット (0)"
        onClick={resetViewport}
        className="w-10 h-10 rounded-lg text-text-muted hover:bg-surface2 hover:text-text-base transition-all text-[10px] font-mono"
      >
        1:1
      </button>
    </aside>
  );
}

function ToolButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      title={label}
      onClick={onClick}
      className={`w-10 h-10 rounded-lg transition-all ${
        active
          ? "bg-accent/10 text-accent hover:bg-accent/15"
          : "text-text-muted hover:bg-surface2 hover:text-text-base"
      }`}
    >
      {icon}
    </Button>
  );
}

function Divider() {
  return <div className="w-8 h-px bg-border my-1" />;
}
