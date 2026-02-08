"use client";
import React, { useState, useEffect } from 'react';

// --- 定数・ユーティリティ ---
const DIARY_KEYS = ["事実", "発見", "教訓", "宣言", "悩み"];
const GET_TODAY = () => new Date().toISOString().split('T')[0];
const IS_WEEKEND = [0, 6].includes(new Date().getDay());

export default function ReflectionApp() {
  const [date, setDate] = useState(GET_TODAY());
  const [logs, setLogs] = useState<string[]>([]);
  const [diary, setDiary] = useState<Record<string, string>>({});
  const [inputText, setInputText] = useState("");

  // データの読み込み
  useEffect(() => {
    const saved = localStorage.getItem(`data_${date}`);
    if (saved) {
      const { logs, diary } = JSON.parse(saved);
      setLogs(logs || []);
      setDiary(diary || {});
    } else {
      setLogs([]); setDiary({});
    }
  }, [date]);

  // データの保存
  const saveData = (newLogs: string[], newDiary: Record<string, string>) => {
    localStorage.setItem(`data_${date}`, JSON.stringify({ logs: newLogs, diary: newDiary }));
  };

  // ログの追加 (30_記法の解釈)
  const addLog = () => {
    if (!inputText) return;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    const match = inputText.match(/^(\d+)_/);
    const newLog = match 
      ? `[${time}] (${match[1]}min) ${inputText.replace(match[0], "")}`
      : `[${time}] ${inputText}`;
    
    const nextLogs = [...logs, newLog];
    setLogs(nextLogs);
    saveData(nextLogs, diary);
    setInputText("");
  };

  // JSON出力 & プロンプトコピー
  const copyForAI = () => {
    const data = { date, logs, diary };
    const prompt = `以下のログを元に、今週の振り返りを手伝ってください。\n1.良かったこと3つ\n2.悩みへの対策\n3.来週の1つのテーマ\n\nデータ: ${JSON.stringify(data)}`;
    navigator.clipboard.writeText(prompt);
    alert("AI用プロンプトをコピーしました！");
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-50 min-h-screen font-sans">
      {/* ヘッダー & 週末リマインド */}
      <header className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">振り返りログ</h1>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="text-sm bg-transparent border-none" />
        {IS_WEEKEND && <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 text-xs rounded border border-yellow-200">✨ 週末です！JSONを出力して振り返りましょう</div>}
      </header>

      {/* 1行ログ入力 */}
      <section className="mb-8">
        <div className="flex gap-2 mb-2">
          <input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addLog()}
            placeholder="30_読書 or 内容のみ" className="flex-1 p-3 rounded-lg border focus:ring-2 focus:ring-blue-400 outline-none text-sm" />
          <button onClick={addLog} className="bg-blue-600 text-white px-4 rounded-lg text-sm font-bold">追加</button>
        </div>
        <p className="text-[10px] text-gray-400 ml-1">例: 30_タスク名 (分数を自動解釈)</p>
        <div className="mt-4 space-y-1">
          {logs.map((log, i) => (
            <div key={i} className="text-sm bg-white p-2 rounded border-l-4 border-blue-400 shadow-sm flex justify-between group">
              <span>{log}</span>
              <button onClick={() => { const n = logs.filter((_, idx) => idx !== i); setLogs(n); saveData(n, diary); }} className="text-gray-300 hover:text-red-400">×</button>
            </div>
          ))}
        </div>
      </section>

      {/* 5行日記セクション */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Daily 5-Line</h2>
        {DIARY_KEYS.map(key => (
          <div key={key}>
            <label className="text-xs text-gray-400 ml-1">{key}</label>
            <textarea value={diary[key] || ""} onChange={(e) => { const n = { ...diary, [key]: e.target.value }; setDiary(n); saveData(logs, n); }}
              className="w-full p-2 text-sm rounded border-gray-200 border resize-none focus:border-blue-300 outline-none" rows={1} />
          </div>
        ))}
      </section>

      {/* アクション */}
      <footer className="mt-10 pb-10">
        <button onClick={copyForAI} className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all">
          JSON + プロンプトをコピー
        </button>
      </footer>
    </div>
  );
}