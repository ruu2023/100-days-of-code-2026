"use client";

import { useState, useMemo } from 'react';

const JAPANESE_CHRS_PER_MINUET = 400; // 400文字/分

function calcStats(text: string) {
  const totalChars = text.length; // includes space
  
  const charsNoSpace = text.replace(/\s/g, "").length;

  const lines = text === "" ? 0 : text.split("\n").length;
  
  const words = text.trim() === "" ? 0: text.trim().split(/\s+/).length;

  const readingMinutes =
    charsNoSpace === 0
      ? 0
      : Math.max(1, Math.round(charsNoSpace/ JAPANESE_CHRS_PER_MINUET));

  return { totalChars, charsNoSpace, lines, words, readingMinutes };
}

type StatItem = {
  label: string;
  value: number;
  unit: string;
  color: string;
}

export default function TextStatsApp() {
  const [text, setText] = useState("");

  const stats = useMemo(() => calcStats(text), [text]);

  const statItems: StatItem[] = [
    { label: "文字数", value: stats.totalChars, unit: "文字", color: "text-violet-400" },
    { label: "空白なし", value: stats.charsNoSpace, unit: "文字", color: "text-violet-400" },
    { label: "行数", value: stats.lines, unit: "行", color: "text-violet-400" },
    { label: "単語数", value: stats.words, unit: "語", color: "text-violet-400" },
    { label: "読了時間", value: stats.readingMinutes, unit: "分", color: "text-violet-400" },
  ];

  const handleClear = () => setText("");

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 flex flex-col items-center">
      {/* ヘッダー */}
      <h1 className="text-3xl font-bold tracking-tight">
        テキスト統計アプリ
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        文章を入力してください - リアルタイムで統計値が更新されます
      </p>
      
      {/* 統計カード */}
      <div className="grid grid-cols-5 gap-3 w-full max-w-2xl mb-6">
        {statItems.map((item) => (
          <div key={item.label} className="bg-gray-800 rounded-lg p-3 text-center">
            <div className={`${item.color} text-2xl font-bold`}>{item.value}</div>
            <div className="text-sm text-gray-500">{item.unit}</div>
            <div className="text-sm text-gray-400">{item.label}</div>
          </div>
        ))}
      </div>
      
      {/* テキスト入力エリア */}
      <div className="w-full max-w-2xl">
        <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full h-64 rounded-xl bg-gray-800 text-gray-100 border border gray-700 p-4 text-sm leading-relaxed resize-none outline-none focus:border-violet-500 transition-colors placeholder-gray-600" />

        {/* clear button */}
        <div className="flex justify-end mt-2">
          <button onClick={handleClear} className="text-xs text-gray-500 hover:text-violet-400 transition-colors">
            クリア
          </button>
        </div>
      </div>
    </div>
  )
}