"use client";

import { useState, useEffect } from "react";
import { useSql } from "@/hooks/useSql";
import { Play, RotateCcw, CheckCircle2, AlertCircle, Database, Layout, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PROBLEMS = [
  {
    id: 1,
    title: "全てのユーザーを取得",
    description: "users テーブルから全てのカラムを取得してください。",
    target: "SELECT * FROM users;",
  },
  {
    id: 2,
    title: "役割(role)が 'User' の人を抽出",
    description: "role が 'User' であるユーザーの名前(name)を全て取得してください。",
    target: "SELECT name FROM users WHERE role = 'User';",
  },
  {
    id: 3,
    title: "スコアが高い順に並べ替え",
    description: "全てのユーザーを score が高い順（降順）に並べ替えて取得してください。",
    target: "SELECT * FROM users ORDER BY score DESC;",
  },
];

export default function Home() {
  const { runQuery, error, loading } = useSql();
  const [currentProblemIdx, setCurrentProblemIdx] = useState(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const currentProblem = PROBLEMS[currentProblemIdx];

  const handleExecute = () => {
    const res = runQuery(query);
    if (res && res.length > 0) {
      setResults(res);
      // Simple correctness check (comparing results or target string)
      // For this prototype, we'll check if the query matches approximately or output matches
      const targetRes = runQuery(currentProblem.target);
      if (JSON.stringify(res) === JSON.stringify(targetRes)) {
        setIsCorrect(true);
      } else {
        setIsCorrect(false);
      }
    } else {
      setResults([]);
      setIsCorrect(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsCorrect(null);
  };

  const addKeyword = (keyword: string) => {
    setQuery((prev) => prev + (prev.endsWith(" ") || prev === "" ? "" : " ") + keyword + " ");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Database className="w-12 h-12 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen p-4 pb-24 md:p-8">
      <div className="gradient-bg" />
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
              <Database className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">SQL DRILL</h1>
          </div>
          <div className="flex gap-2">
             <div className="px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-400/30 rounded-full glass">
               Day 023
             </div>
          </div>
        </header>

        {/* Problem Card */}
        <section className="glass p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-blue-400 uppercase tracking-wider">Problem {currentProblem.id}</h2>
            <span className="text-xs text-zinc-500">{currentProblemIdx + 1} / {PROBLEMS.length}</span>
          </div>
          <h3 className="text-xl font-semibold">{currentProblem.title}</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">{currentProblem.description}</p>
        </section>

        {/* Editor Area */}
        <section className="space-y-4">
          <div className="glass p-2 flex flex-wrap gap-2 overflow-x-auto no-scrollbar">
            {["SELECT", "*", "FROM", "WHERE", "ORDER BY", "DESC", "users", "name", "role", "score"].map((kw) => (
              <button
                key={kw}
                onClick={() => addKeyword(kw)}
                className="px-3 py-1.5 text-xs font-mono rounded-lg glass-button whitespace-nowrap"
              >
                {kw}
              </button>
            ))}
          </div>

          <div className="relative group">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ここに SQL を入力してください..."
              className="w-full h-40 p-4 bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm resize-none transition-all"
            />
            {error && (
              <div className="absolute bottom-4 left-4 right-4 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              <button onClick={handleClear} className="p-2 glass-button rounded-xl text-zinc-400">
                <RotateCcw className="w-5 h-5" />
              </button>
              <button 
                onClick={handleExecute}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/20"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>実行</span>
              </button>
            </div>
          </div>
        </section>

        {/* Results */}
        <AnimatePresence mode="wait">
          {(results.length > 0 || isCorrect !== null) && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="glass overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-400">Execution Result</span>
                {isCorrect === true && (
                  <div className="flex items-center gap-1.5 text-green-400 text-sm font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>正解！</span>
                  </div>
                )}
                {isCorrect === false && results.length > 0 && (
                  <div className="flex items-center gap-1.5 text-amber-400 text-sm font-semibold">
                    <AlertCircle className="w-4 h-4" />
                    <span>不正解（結果が異なります）</span>
                  </div>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5">
                    <tr>
                      {results[0]?.columns.map((col: string) => (
                        <th key={col} className="px-6 py-3 font-semibold text-zinc-300">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {results[0]?.values.map((row: any[], i: number) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        {row.map((val: any, j: number) => (
                          <td key={j} className="px-6 py-3 text-zinc-400 font-mono">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Next Problem Button */}
        {isCorrect && currentProblemIdx < PROBLEMS.length - 1 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center pt-4"
          >
            <button
              onClick={() => {
                setCurrentProblemIdx((prev) => prev + 1);
                handleClear();
              }}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
            >
              次の問題へ
            </button>
          </motion.div>
        )}
      </div>

      {/* iPhone Navigation Bar Placeholder (for feel) */}
      <div className="fixed bottom-0 left-0 right-0 h-16 glass rounded-t-3xl border-t-0 flex items-center justify-around px-8 md:hidden">
        <div className="flex flex-col items-center gap-1 text-blue-500">
          <Layout className="w-6 h-6" />
          <span className="text-[10px] font-medium">Practice</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-zinc-500">
          <Database className="w-6 h-6" />
          <span className="text-[10px] font-medium">Database</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-zinc-500">
          <Smartphone className="w-6 h-6" />
          <span className="text-[10px] font-medium">Profile</span>
        </div>
      </div>
    </main>
  );
}
