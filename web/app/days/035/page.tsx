"use client";

import React, { useState, useEffect } from 'react';
import { Save, Trash2, Edit3, Eye, Zap } from 'lucide-react';

export default function MarkdownMemo() {
  const [markdown, setMarkdown] = useState<string>('');
  const [isPreview, setIsPreview] = useState<boolean>(false);

  // --- 簡易マークダウンパーサー (ライブラリ不要) ---
  const parseMarkdown = (text: string) => {
    return text
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4 border-b pb-2">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium mt-4 mb-2">$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
      .replace(/\n/gim, '<br />');
  };

  // --- ローカルストレージ処理 ---
  useEffect(() => {
    const saved = localStorage.getItem('quick-memo-v2');
    setMarkdown(saved || '# Hello World\n- **太字**も使えます\n- 30分で完成させよう');
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('quick-memo-v2', markdown);
    }, 500);
    return () => clearTimeout(timer);
  }, [markdown]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* ヘッダー */}
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg shadow-lg shadow-blue-500/20">
              <Zap size={20} className="text-white fill-current" />
            </div>
            <h1 className="font-bold text-lg hidden sm:block">Quick Markdown</h1>
          </div>

          <div className="flex gap-2">
            <button onClick={() => confirm('Clear?') && setMarkdown('')} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
              <Trash2 size={20} />
            </button>
          </div>
        </header>

        {/* メインエリア */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[70vh] mt-3">
          {/* 入力エリア */}
          <section className={`${isPreview ? 'hidden md:block' : 'block'}`}>
            <div className="flex items-center justify-between mb-2 text-xs font-bold uppercase text-slate-400">
              <span>Markdown Editor</span>
              <span className="flex items-center gap-1"><Save size={12}/> Auto-saving</span>
            </div>
            <textarea
              className="w-full h-[70vh] p-6 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none font-mono text-sm leading-relaxed"
              placeholder="Start typing..."
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              autoFocus
            />
          </section>

          {/* 出力エリア */}
          <div className={`relative ${!isPreview ? 'hidden md:block' : 'block'}`}>
            <div 
              className="w-full h-[73vh] p-6 bg-slate-50 border border-slate-200 rounded-2xl overflow-y-auto text-slate-800 shadow-xl prose-custom"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(markdown) }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}