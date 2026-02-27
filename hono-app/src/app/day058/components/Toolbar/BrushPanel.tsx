"use client";

import { useEffect } from "react";
import { useCanvasStore } from "@/app/day058/store/useCanvasStore";
import { SWATCHES } from "@/app/day058/types";
import { Slider } from "@/components/ui/slider";

export function BrushPanel() {
  const {
    color, setColor,
    size, setSize,
    opacity, setOpacity,
    setBrushType, setSmoothing,
  } = useCanvasStore();

  // Pencil固定、smoothing常時0
  useEffect(() => {
    setBrushType("pencil");
    setSmoothing(0);
  }, [setBrushType, setSmoothing]);

  return (
    <div className="flex flex-col gap-4">
      {/* Color */}
      <Section title="Color">
        <div
          className="w-full h-9 rounded-lg border border-border relative overflow-hidden mb-2.5 cursor-pointer shadow-sm"
          style={{ background: color }}
        >
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </div>
        <div className="grid grid-cols-8 gap-[3px]">
          {SWATCHES.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              title={c}
              className={`aspect-square rounded-sm cursor-pointer transition-transform hover:scale-110 ${
                color === c ? "ring-2 ring-accent ring-offset-1 ring-offset-surface" : ""
              }`}
              style={{ background: c, border: "1px solid rgba(0,0,0,0.08)" }}
            />
          ))}
        </div>
      </Section>

      {/* Brush */}
      <Section title="Brush">
        {/* Preview */}
        <div className="w-full h-12 bg-surface2 rounded-lg border border-border flex items-center justify-center mb-2.5 shadow-inner">
          <div
            className="transition-all rounded-sm"
            style={{
              width: Math.min(size * 2, 44),
              height: Math.min(size * 2, 44),
              background: color,
              opacity: opacity / 100,
            }}
          />
        </div>

        {/* Sliders */}
        <SliderRow
          label="Size"
          value={size}
          min={1}
          max={100}
          onChange={setSize}
        />
        <SliderRow
          label="Opac"
          value={opacity}
          min={1}
          max={100}
          onChange={setOpacity}
        />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[10px] font-mono text-text-muted tracking-widest uppercase mb-2.5">
        {title}
      </h3>
      {children}
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[11px] font-mono text-text-muted w-7 flex-shrink-0">{label}</span>
      <Slider
        min={min}
        max={max}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="flex-1 [&_[data-slot=slider-track]]:bg-border [&_[data-slot=slider-range]]:bg-accent [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-accent [&_[data-slot=slider-thumb]]:shadow-sm"
      />
      <span className="text-[10px] font-mono text-text-muted w-6 text-right flex-shrink-0">{value}</span>
    </div>
  );
}
