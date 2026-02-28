"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Database, Search, Table, RefreshCcw } from 'lucide-react';

/**
 * 30分写経: Drizzle 精密タイピング (安定版)
 * 入力欄と表示を一体化し、記号の判定ミスを防ぐ設計。
 */

type User = { id: number; name: string; role: 'admin' | 'user' };

const CHALLENGES = [
  { id: 1, label: "Userを一人作成", query: "db.insert(users).values({ id: 2, name: 'Lisa', role: 'user' })", action: "INSERT" },
  { id: 2, label: "IDが2を検索", query: "db.select().from(users).where(eq(users.id, 2))", action: "SELECT" },
  { id: 3, label: "Masterに更新", query: "db.update(users).set({ name: 'Master' }).where(eq(users.id, 2))", action: "UPDATE" },
  { id: 4, label: "テーブルを空にする", query: "db.delete(users)", action: "DELETE" },
];

export default function DrizzleStableTypist() {
  const [users, setUsers] = useState<User[]>([{ id: 1, name: "Nick", role: "admin" }]);
  const [queryResult, setQueryResult] = useState<User[] | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const challenge = CHALLENGES[currentStep];

  // 判定ロジック: 入力が完了したか
  useEffect(() => {
    if (userInput === challenge.query) {
      handleExecute();
    }
  }, [userInput]);

  const handleExecute = () => {
    // 疑似DBアクション
    if (challenge.action === "INSERT") setUsers([...users, { id: 2, name: "Lisa", role: "user" }]);
    if (challenge.action === "SELECT") setQueryResult(users.filter(u => u.id === 2));
    if (challenge.action === "UPDATE") setUsers(users.map(u => u.id === 2 ? { ...u, name: "Master" } : u));
    if (challenge.action === "DELETE") { setUsers(users.filter(u => u.id !== 2)); setQueryResult(null); setIsFinished(true); }

    setUserInput("");
    setCurrentStep((prev) => (prev + 1) % CHALLENGES.length);
  };
  
  const [isFinished, setIsFinished] = useState(false);

  if(isFinished) {
    setTimeout(() => setIsFinished(false), 5000);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-300 p-4 font-mono select-none">
      <div className="max-w-4xl mx-auto space-y-6 mt-10">
        
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Database className="text-cyan-400" size={24} />
            <h1 className="text-lg font-bold text-white uppercase tracking-widest">Drizzle Training</h1>
          </div>
          <div className="text-[10px] text-slate-500 font-bold">Step {currentStep + 1} of {CHALLENGES.length}</div>
        </div>

        {/* メインタイピングエリア */}
        {isFinished ? (
          <p>Challenge completed!</p>
        ) : (
        <div 
          className="bg-[#111114] border border-white/5 rounded-2xl p-8 shadow-2xl cursor-text relative transition-all"
          onClick={() => inputRef.current?.focus()}
        >
          <div className="text-xs text-cyan-500/90 mb-4 flex items-center gap-2 font-sans italic">
             <Terminal size={14} /> // {challenge.label}
          </div>

          <div className="text-xl leading-relaxed break-all relative min-h-[60px]">
            {/* 判定表示レイヤー */}
            {challenge.query.split("").map((char, i) => {
              let color = "text-slate-700"; // 未入力
              if (i < userInput.length) {
                color = userInput[i] === char ? "text-cyan-400" : "text-rose-500 bg-rose-500/30 ring-1 ring-rose-500";
              }
              // 現在の入力位置にカーソル表示
              const isCursor = i === userInput.length;
              return (
                <span key={i} className={`${color} relative`}>
                  {char}
                  {isCursor && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-400 animate-pulse" />}
                </span>
              );
            })}

            {/* 隠しTextArea (入力の受け皿) */}
            <textarea
              ref={inputRef}
              autoFocus
              className="absolute inset-0 opacity-0 cursor-default resize-none"
              value={userInput}
              onChange={(e) => {
                // 課題の文字数を超えないように制御
                if (e.target.value.length <= challenge.query.length) {
                  setUserInput(e.target.value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>
        )}

        {/* データプレビュー */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/40 border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-3 tracking-widest uppercase">
              <Search size={12}/> Query Result
            </div>
            <div className="text-xs text-green-400 font-mono">
              {queryResult ? JSON.stringify(queryResult, null, 2) : "// No selection results"}
            </div>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-3 tracking-widest uppercase">
              <Table size={12}/> Table: users
            </div>
            <table className="space-y-1 border-white p-0">
              <thead>
                <tr>
                  <th className="text-slate-300 w-20 text-left">id</th>
                  <th className="text-slate-300 w-40 text-left">name</th>
                  <th className="text-slate-300 w-40 text-left">role</th>
                </tr>
              </thead>
              <tbody>
              {!isFinished && users.map(u => (
                <tr key={u.id} className="border-white">
                  <td className="text-slate-300 text-left border border-white p-1">{u.id}</td>
                  <td className="text-slate-300 text-left border border-white p-1">{u.name}</td>
                  <td className="text-slate-300 text-left border border-white p-1">{u.role}</td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 操作ガイド */}
        <div className="text-center">
          <button 
            onClick={() => {setUserInput(""); setUsers([]); setQueryResult(null); setCurrentStep(0);}}
            className="text-[10px] text-slate-600 hover:text-cyan-500 flex items-center gap-1 mx-auto transition-colors"
          >
            <RefreshCcw size={10} /> RESET ALL PROGRESS
          </button>
        </div>

      </div>
    </div>
  );
}