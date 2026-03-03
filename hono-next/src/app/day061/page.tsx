"use client";

import React, { useState, useMemo } from 'react';
import { Search, Command, Keyboard } from 'lucide-react';

// ショートカットのデータ定義
const SHORTCUTS = [
  { key: "Cmd/Ctrl + Shift + P", desc: "コマンドパレットを開く", cat: "General" },
  { key: "Cmd/Ctrl + P", desc: "クイックオープン (ファイル検索)", cat: "General" },
  { key: "Cmd/Ctrl + B", desc: "サイドバーの表示/非表示", cat: "UI" },
  { key: "Cmd/Ctrl + J", desc: "パネル（ターミナル等）の表示/非表示", cat: "UI" },
  { key: "Option + ↑/↓", desc: "行の上下移動", cat: "Edit" },
  { key: "Shift + Option + ↑/↓", desc: "行の上下コピー", cat: "Edit" },
  { key: "Cmd/Ctrl + D", desc: "選択中の単語を次々選択", cat: "Edit" },
  { key: "Cmd/Ctrl + Shift + L", desc: "選択中の単語をすべて選択", cat: "Edit" },
  { key: "Cmd/Ctrl + /", desc: "行コメントの切り替え", cat: "Edit" },
  { key: "Control + G", desc: "指定した行へ移動", cat: "Nav" },
  { key: "Cmd/Ctrl + Shift + F", desc: "プロジェクト内全検索", cat: "Nav" },
  { key: "Option + Z", desc: "右端での折り返し切り替え", cat: "UI" },
];

export default function VSCodeCheatsheet() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // カテゴリー一覧の抽出
  const categories = ["All", ...new Set(SHORTCUTS.map(s => s.cat))];

  // 検索とフィルターのロジック
  const filteredShortcuts = useMemo(() => {
    return SHORTCUTS.filter(s => {
      const matchesSearch = s.desc.toLowerCase().includes(search.toLowerCase()) || 
                          s.key.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "All" || s.cat === filter;
      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto">
        {/* ヘッダーセクション */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2 mb-2">
            <Command className="w-8 h-8 text-blue-600" />
            VS Code Shortcuts
          </h1>
          <p className="text-slate-500 text-sm">開発効率を高める自分専用ツール</p>
        </header>

        {/* コントロールパネル（検索 & フィルター） */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="検索（例: ファイル, 移動, Cmd...）"
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === cat ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* メインリスト */}
        <div className="grid gap-3">
          {filteredShortcuts.map((item, index) => (
            <div 
              key={index} 
              className="group bg-white p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between hover:border-blue-300 hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div className="mb-2 sm:mb-0">
                <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">{item.cat}</span>
                <p className="text-slate-700 font-medium">{item.desc}</p>
              </div>
              <div className="flex gap-1 items-center">
                <Keyboard className="w-4 h-4 text-slate-300 mr-1" />
                {item.key.split(" + ").map((k, i) => (
                  <React.Fragment key={i}>
                    <kbd className="px-2 py-1 bg-slate-100 border-b-2 border-slate-300 rounded text-xs font-mono font-bold text-slate-600">
                      {k}
                    </kbd>
                    {i < item.key.split(" + ").length - 1 && <span className="text-slate-400 text-xs">+</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 0件ヒット時の表示 */}
        {filteredShortcuts.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            該当するショートカットが見つかりません。
          </div>
        )}

        <footer className="mt-12 text-center text-slate-400 text-xs">
          Built with 30-min coding for 100 Days of Code.
        </footer>
      </div>
    </div>
  );
}