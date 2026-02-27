"use client";

import { useEffect, useRef } from "react";
import { useCanvasStore } from "@/app/day058/store/useCanvasStore";
import type { Layer } from "@/app/day058/types";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Copy, Layers } from "lucide-react";

export function LayersPanel() {
  const {
    layers,
    activeLayerIndex,
    setActiveLayer,
    toggleLayerVisibility,
    setLayerOpacity,
    addLayer,
    deleteLayer,
    mergeLayers,
    duplicateLayer,
  } = useCanvasStore();

  return (
    <div>
      <h3 className="text-[10px] font-mono text-text-muted tracking-widest uppercase mb-2.5">
        Layers
      </h3>

      {/* Layer list — reversed so top layer shows first */}
      <div className="flex flex-col gap-0.5 mb-2">
        {[...layers].reverse().map((layer, revIdx) => {
          const idx = layers.length - 1 - revIdx;
          return (
            <LayerItem
              key={layer.id}
              layer={layer}
              active={idx === activeLayerIndex}
              onSelect={() => setActiveLayer(idx)}
              onToggleVisibility={() => toggleLayerVisibility(idx)}
              onOpacityChange={(v) => setLayerOpacity(idx, v)}
            />
          );
        })}
      </div>

      {/* Layer actions */}
      <div className="grid grid-cols-2 gap-1">
        <SmallBtn onClick={addLayer} icon={<Plus className="size-3" />}>Add</SmallBtn>
        <SmallBtn onClick={deleteLayer} disabled={layers.length <= 1} icon={<Minus className="size-3" />}>Del</SmallBtn>
        <SmallBtn onClick={duplicateLayer} icon={<Copy className="size-3" />}>Dup</SmallBtn>
        <SmallBtn onClick={mergeLayers} disabled={activeLayerIndex === 0} icon={<Layers className="size-3" />}>Merge</SmallBtn>
      </div>
    </div>
  );
}

function LayerItem({
  layer,
  active,
  onSelect,
  onToggleVisibility,
}: {
  layer: Layer;
  active: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onOpacityChange: (v: number) => void;
}) {
  const thumbRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const thumb = thumbRef.current;
    if (!thumb) return;
    thumb.width = 28;
    thumb.height = 22;
    thumb.getContext("2d")?.drawImage(layer.canvas, 0, 0, 28, 22);
  });

  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer border transition-all ${
        active
          ? "bg-accent/8 border-accent/25 shadow-sm"
          : "border-transparent hover:bg-surface2"
      }`}
    >
      {/* Thumb */}
      <div className="w-7 h-[22px] rounded bg-surface2 border border-border overflow-hidden flex-shrink-0 shadow-inner">
        <canvas ref={thumbRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Name */}
      <span className={`text-[11px] flex-1 truncate ${active ? "text-text-base font-medium" : "text-text-muted"}`}>
        {layer.name}
      </span>

      {/* Visibility */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility();
        }}
        className="text-[12px] text-text-muted hover:text-text-base transition-colors"
        title={layer.visible ? "非表示にする" : "表示する"}
      >
        {layer.visible ? "👁" : "🙈"}
      </button>
    </div>
  );
}

function SmallBtn({
  children,
  onClick,
  disabled,
  icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="py-1.5 h-auto text-[10px] font-mono text-text-muted hover:text-text-base gap-1 border-border hover:border-accent/40 hover:bg-surface2"
    >
      {icon}
      {children}
    </Button>
  );
}
