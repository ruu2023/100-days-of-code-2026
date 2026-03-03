"use client";

import React, { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };
type DrawLineProps = { prevPoint: Point | null; currentPoint: Point; color: string };

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prevPoint, setPrevPoint] = useState<Point | null>(null);
  const [color, setColor] = useState("#3b82f6");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
  }, []);

  const drawLine = ({ prevPoint, currentPoint, color, ctx }: DrawLineProps & { ctx: CanvasRenderingContext2D }) => {
    const startPoint = prevPoint ?? currentPoint;
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (e.buttons !== 1) return;

    const rect = canvas.getBoundingClientRect();
    const currentPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const drawData = { prevPoint, currentPoint, color };
      drawLine({ ...drawData, ctx });
      setPrevPoint(currentPoint);
    }
  };

  const stopDrawing = () => setPrevPoint(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="mb-4 flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Whiteboard</h1>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-10 h-10 cursor-pointer rounded-lg border-none"
        />
        <button
          onClick={() => {
            const ctx = canvasRef.current?.getContext("2d");
            ctx?.clearRect(0, 0, 800, 600);
          }}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Clear
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="bg-white border-2 border-gray-200 rounded-2xl shadow-2xl cursor-crosshair touch-none"
      />
      <p className="mt-4 text-gray-500 text-sm italic">クリック&ドラッグで描画</p>
    </div>
  );
}
