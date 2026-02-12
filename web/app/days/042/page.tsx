"use client";

import React, { useState, useEffect } from "react";

// GitHub風のカラーパレット定義（0: 空, 1: 薄い, 2: 中間, 3: 濃い, 4: 最も濃い）
const COLORS = [
  "bg-zinc-800",   // Level 0 (Empty)
  "bg-emerald-900", // Level 1
  "bg-emerald-700", // Level 2
  "bg-emerald-500", // Level 3
  "bg-emerald-300", // Level 4
];

export default function GrassEditor() {
  // 12週間分 (7行 × 12列 = 84マス) の状態を管理
  const [grid, setGrid] = useState<number[]>(Array(84).fill(0));
  // 現在選択しているペンの色（Level 0〜4）
  const [selectedLevel, setSelectedLevel] = useState<number>(3);
  // マウスが押されているかどうかのフラグ（ドラッグ塗り用）
  const [isMouseDown, setIsMouseDown] = useState(false);

  // 指定したインデックスのセルの色を更新する関数
  const updateCell = (index: number) => {
    const newGrid = [...grid];
    newGrid[index] = selectedLevel;
    setGrid(newGrid);
  };

  // グリッドをすべてクリア（リセット）
  const clearGrid = () => {
    setGrid(Array(84).fill(0));
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center font-sans">
      <h1 className="text-2xl font-bold mb-8 text-emerald-400">GitHub Grass Designer</h1>

      {/* メインのグリッドエリア */}
      <div 
        className="grid grid-flow-col grid-rows-7 gap-1 bg-zinc-900 p-4 rounded-md border border-zinc-700 shadow-xl"
        onMouseDown={() => setIsMouseDown(true)}
        onMouseUp={() => setIsMouseDown(false)}
        onMouseLeave={() => setIsMouseDown(false)}
      >
        {grid.map((level, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-sm cursor-pointer transition-colors duration-200 ${COLORS[level]}`}
            onMouseDown={() => updateCell(i)}
            onMouseEnter={() => isMouseDown && updateCell(i)}
          />
        ))}
      </div>

      {/* コントロールパネル */}
      <div className="mt-10 flex flex-col items-center gap-6">
        {/* パレット選択 */}
        <div className="flex items-center gap-3 bg-zinc-800 p-3 rounded-full border border-zinc-600">
          <span className="text-sm text-zinc-400 mr-2">Select Color:</span>
          {COLORS.map((colorClass, level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`w-6 h-6 rounded-sm ${colorClass} ${
                selectedLevel === level ? "ring-2 ring-white ring-offset-2 ring-offset-black" : ""
              }`}
            />
          ))}
        </div>

        {/* アクションボタン */}
        <div className="flex gap-4">
          <button
            onClick={clearGrid}
            className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-md text-sm font-medium transition"
          >
            Clear All
          </button>
          <button
            onClick={() => alert("JSONデータとして保存する機能などをここに追加できます！")}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-md text-sm font-medium transition"
          >
            Save Design
          </button>
        </div>
      </div>

      {/* 操作説明 */}
      <p className="mt-12 text-zinc-500 text-xs">
        Tip: クリックまたはドラッグで色を塗ることができます。
      </p>
    </div>
  );
}